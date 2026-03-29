import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  ok,
  created,
  badRequest,
  forbidden,
  serverError,
} from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { marketPriceSchema } from "@/lib/validations/market-price.schema";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 100),
    });

    const categoryId = searchParams.get("category") || undefined;
    const search = searchParams.get("q") || undefined;

    const where = {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { productName: { contains: search } },
          { market: { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.marketPrice.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, nameBn: true, slug: true },
          },
        },
        orderBy: { recordedAt: "desc" },
      }),
      prisma.marketPrice.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/market-prices]", err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return forbidden("Authentication required");
    }
    if (!["admin", "super_admin"].includes(user.role)) {
      return forbidden("Only admins can manage market prices");
    }

    const body = await req.json();
    const parsed = marketPriceSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        "Validation failed",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const record = await prisma.marketPrice.create({
      data: {
        ...parsed.data,
        recordedAt: parsed.data.recordedAt
          ? new Date(parsed.data.recordedAt)
          : new Date(),
      },
      include: { category: true },
    });

    await createAuditLog({
      userId: user.id,
      action: "MARKET_PRICE_CREATED",
      entity: "MarketPrice",
      entityId: record.id,
      newValue: {
        productName: record.productName,
        categoryId: record.categoryId,
      },
    });

    return created(record, "Market price added");
  } catch (err) {
    console.error("[POST /api/market-prices]", err);
    return serverError();
  }
}