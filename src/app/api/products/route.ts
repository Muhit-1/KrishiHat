import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, badRequest, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { productSchema } from "@/lib/validations/product.schema";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
    });

    const categoryId = searchParams.get("category") || undefined;
    const subcategoryId = searchParams.get("subcategory") || undefined;
    const search = searchParams.get("q") || undefined;
    const sellerId = searchParams.get("seller") || undefined;
    const condition = searchParams.get("condition") || undefined;
    const statusParam = searchParams.get("status") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;

    // Check if the caller is an admin/moderator/super_admin so they can
    // see products of any status. Public callers always see only "active".
    const currentUser = await getCurrentUser();
    const isPrivileged =
      currentUser &&
      ["admin", "super_admin", "moderator"].includes(currentUser.role);

    // Build the status condition:
    // - Privileged users: honour the ?status= param (or no filter when omitted)
    // - Everyone else:    always restrict to "active"
    let statusCondition: Record<string, unknown>;
    if (isPrivileged) {
      // Allow filtering by a specific status, or return ALL statuses when none given
      statusCondition = statusParam ? { status: statusParam } : {};
    } else {
      // Public / buyer / seller → only active products
      statusCondition = { status: "active" };
    }

    const where = {
      deletedAt: null,
      ...statusCondition,
      ...(categoryId && { categoryId }),
      ...(subcategoryId && { subcategoryId }),
      ...(sellerId && { sellerId }),
      ...(condition && { condition: condition as any }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { titleBn: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { id: true, name: true, nameBn: true, slug: true } },
          seller: {
            include: {
              profile: { select: { fullName: true } },
              sellerProfile: { select: { shopName: true, isVerified: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/products]", err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "seller") return forbidden("Only sellers can create products");

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
    if (!sellerProfile?.isVerified) return forbidden("Complete seller verification first");

    if (parsed.data.listingType === "auction") {
      const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!category?.auctionAllowed) return badRequest("Auction is not allowed for this category");
    }

    const slug = generateUniqueSlug(parsed.data.title, Date.now().toString(36));

    const product = await prisma.product.create({
      data: { ...parsed.data, sellerId: user.id, slug, status: "draft" },
    });

    await createAuditLog({
      userId: user.id,
      action: "PRODUCT_CREATED",
      entity: "Product",
      entityId: product.id,
      newValue: { title: product.title, sellerId: user.id },
    });

    return created(product, "Product created. Pending review.");
  } catch (err) {
    console.error("[POST /api/products]", err);
    return serverError();
  }
}