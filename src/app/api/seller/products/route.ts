import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "seller") return unauthorized();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
    });

    const status = searchParams.get("status") || undefined;

    const where = {
      sellerId: user.id,
      deletedAt: null,
      ...(status && { status: status as any }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          // FIX: Added auctionAllowed to category select so auction page can filter correctly
          category: { select: { id: true, name: true, auctionAllowed: true } },
          subcategory: { select: { id: true, name: true } },
          // FIX: Include auction relation so we can filter out products that already have one
          auction: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/seller/products]", err);
    return serverError();
  }
}