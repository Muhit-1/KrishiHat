import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin"].includes(user.role)) return forbidden();

    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalOrders,
      pendingOrders,
      totalProducts,
      activeProducts,
      revenueResult,
      pendingPayments,
      inTransitShipments,
      openReports,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: "seller", deletedAt: null } }),
      prisma.user.count({ where: { role: "buyer", deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { status: "pending", deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { status: "active", deletedAt: null } }),
      prisma.payment.aggregate({
        where: { status: "paid" },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: "pending" } }),
      prisma.shipment.count({ where: { status: "in_transit" } }),
      prisma.report.count({ where: { status: "open" } }),
      prisma.order.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { include: { profile: { select: { fullName: true } } } },
          seller: { include: { sellerProfile: { select: { shopName: true } } } },
          payment: { select: { status: true, method: true } },
        },
      }),
    ]);

    return ok({
      totalUsers,
      totalSellers,
      totalBuyers,
      totalOrders,
      pendingOrders,
      totalProducts,
      activeProducts,
      totalRevenue: Number(revenueResult._sum.amount || 0),
      pendingPayments,
      inTransitShipments,
      openReports,
      recentOrders,
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return serverError();
  }
}