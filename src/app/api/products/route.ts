import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, serverError } from "@/lib/utils/api-response";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
    });

    const categoryId = searchParams.get("category") || undefined;
    const search = searchParams.get("q") || undefined;

    const where = {
      status: "active" as const,
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { titleBn: { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
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