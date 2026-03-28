import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin", "moderator"].includes(user.role)) return forbidden();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 30),
    });

    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("q") || undefined;

    const where = {
      deletedAt: null,
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { id: { contains: search } },
          { buyer: { profile: { fullName: { contains: search } } } },
          { seller: { sellerProfile: { shopName: { contains: search } } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          buyer: { include: { profile: { select: { fullName: true } } } },
          seller: { include: { sellerProfile: { select: { shopName: true } } } },
          payment: { select: { status: true, method: true, amount: true } },
          shipment: { select: { status: true, trackingNumber: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/admin/orders]", err);
    return serverError();
  }
}