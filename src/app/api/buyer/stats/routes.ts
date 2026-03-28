import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "buyer") return unauthorized();

    const [totalOrders, pendingOrders, deliveredOrders, cart] = await Promise.all([
      prisma.order.count({ where: { buyerId: user.id, deletedAt: null } }),
      prisma.order.count({ where: { buyerId: user.id, status: "pending", deletedAt: null } }),
      prisma.order.count({ where: { buyerId: user.id, status: "delivered", deletedAt: null } }),
      prisma.cart.findUnique({
        where: { buyerId: user.id },
        include: { items: true },
      }),
    ]);

    const recentOrders = await prisma.order.findMany({
      where: { buyerId: user.id, deletedAt: null },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { include: { sellerProfile: { select: { shopName: true } } } },
        items: { include: { product: { select: { title: true } } } },
      },
    });

    return ok({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cartItemCount: cart?.items?.length ?? 0,
      recentOrders,
    });
  } catch (err) {
    console.error("[GET /api/buyer/stats]", err);
    return serverError();
  }
}