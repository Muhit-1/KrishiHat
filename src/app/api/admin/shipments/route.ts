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

    const where = {
      ...(status && { status: status as any }),
    };

    const [items, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              buyer: { include: { profile: { select: { fullName: true, phone: true } } } },
              seller: { include: { sellerProfile: { select: { shopName: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.shipment.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/admin/shipments]", err);
    return serverError();
  }
}