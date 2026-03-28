import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "seller") return unauthorized();

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      revenueResult,
      recentOrders,
      sellerProfile,
    ] = await Promise.all([
      prisma.product.count({ where: { sellerId: user.id, deletedAt: null } }),
      prisma.product.count({ where: { sellerId: user.id, status: "active", deletedAt: null } }),
      prisma.order.count({ where: { sellerId: user.id, deletedAt: null } }),
      prisma.order.count({ where: { sellerId: user.id, status: "pending", deletedAt: null } }),
      prisma.order.aggregate({
        where: { sellerId: user.id, status: "delivered", deletedAt: null },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { sellerId: user.id, deletedAt: null },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { include: { profile: { select: { fullName: true } } } },
          items: { select: { id: true } },
        },
      }),
      prisma.sellerProfile.findUnique({ where: { userId: user.id } }),
    ]);

    return ok({
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: Number(revenueResult._sum.totalAmount || 0),
      rating: sellerProfile?.rating || 0,
      isVerified: sellerProfile?.isVerified || false,
      recentOrders,
    });
  } catch (err) {
    console.error("[GET /api/seller/stats]", err);
    return serverError();
  }
}