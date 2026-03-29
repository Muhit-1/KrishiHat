import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "super_admin") return forbidden();

    const [
      totalAdmins,
      totalModerators,
      totalSellers,
      totalBuyers,
      totalUsers,
      suspendedUsers,
      bannedUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      totalAuditLogs,
      recentAdmins,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "admin", deletedAt: null } }),
      prisma.user.count({ where: { role: "moderator", deletedAt: null } }),
      prisma.user.count({ where: { role: "seller", deletedAt: null } }),
      prisma.user.count({ where: { role: "buyer", deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: "suspended", deletedAt: null } }),
      prisma.user.count({ where: { status: "banned", deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.payment.aggregate({
        where: { status: "paid" },
        _sum: { amount: true },
      }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.auditLog.count(),
      prisma.user.findMany({
        where: {
          role: { in: ["admin", "moderator"] },
          deletedAt: null,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { profile: { select: { fullName: true } } },
      }),
    ]);

    return ok({
      totalAdmins,
      totalModerators,
      totalSellers,
      totalBuyers,
      totalUsers,
      suspendedUsers,
      bannedUsers,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalProducts,
      totalAuditLogs,
      recentAdmins,
    });
  } catch (err) {
    console.error("[GET /api/super-admin/stats]", err);
    return serverError();
  }
}