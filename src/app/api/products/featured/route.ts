import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, serverError } from "@/lib/utils/api-response";

export async function GET(_req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { status: "active", deletedAt: null },
      take: 8,
      orderBy: { viewCount: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        seller: {
          include: {
            sellerProfile: {
              select: { shopName: true, isVerified: true },
            },
          },
        },
      },
    });

    return ok(products);
  } catch (err) {
    console.error("[GET /api/products/featured]", err);
    return serverError();
  }
}