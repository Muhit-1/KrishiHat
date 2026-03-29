import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, serverError } from "@/lib/utils/api-response";

export async function GET(_req: NextRequest) {
  try {
    const [totalProducts, totalSellers, totalOrders, totalCategories] =
      await Promise.all([
        prisma.product.count({ where: { status: "active", deletedAt: null } }),
        prisma.user.count({
          where: {
            role: "seller",
            sellerProfile: { isVerified: true },
            deletedAt: null,
          },
        }),
        prisma.order.count({ where: { deletedAt: null } }),
        prisma.category.count({ where: { deletedAt: null } }),
      ]);

    return ok({ totalProducts, totalSellers, totalOrders, totalCategories });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return serverError();
  }
}