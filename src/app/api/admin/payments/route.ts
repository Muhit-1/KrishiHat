import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin"].includes(user.role)) return forbidden();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 30),
    });

    const status = searchParams.get("status") || undefined;
    const method = searchParams.get("method") || undefined;

    const where = {
      ...(status && { status: status as any }),
      ...(method && { method }),
    };

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              buyer: {
                include: { profile: { select: { fullName: true } } },
              },
              seller: {
                include: { sellerProfile: { select: { shopName: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/admin/payments]", err);
    return serverError();
  }
}