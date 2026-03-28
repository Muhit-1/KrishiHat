import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, notFound, serverError } from "@/lib/utils/api-response";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug, deletedAt: null },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        category: true,
        subcategory: true,
        seller: {
          include: {
            profile: { select: { fullName: true } },
            sellerProfile: {
              select: {
                shopName: true,
                shopLogoUrl: true,
                isVerified: true,
                rating: true,
              },
            },
          },
        },
        auction: true,
      },
    });

    if (!product) return notFound("Product not found");

    // Increment view count (non-blocking)
    prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return ok(product);
  } catch (err) {
    console.error("[GET /api/products/slug/[slug]]", err);
    return serverError();
  }
}