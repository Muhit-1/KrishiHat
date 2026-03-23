import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
    });
    const status = searchParams.get("status") || undefined;

    // Buyers see their own orders; sellers see orders for their products
    const where =
      user.role === "buyer"
        ? { buyerId: user.id, deletedAt: null, ...(status && { status: status as any }) }
        : user.role === "seller"
        ? { sellerId: user.id, deletedAt: null, ...(status && { status: status as any }) }
        : ["admin", "super_admin", "moderator"].includes(user.role)
        ? { deletedAt: null, ...(status && { status: status as any }) }
        : { buyerId: "NONE" }; // fallback

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
            },
          },
          buyer: { include: { profile: { select: { fullName: true } } } },
          seller: { include: { sellerProfile: { select: { shopName: true } } } },
          payment: true,
          shipment: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return serverError();
  }
}