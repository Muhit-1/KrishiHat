import { prisma } from "@/lib/db/prisma";
import type { ProductInput } from "@/lib/validations/product.schema";
import { generateUniqueSlug } from "@/lib/utils/slug";

export async function createProduct(sellerId: string, data: ProductInput) {
  // Check if seller is verified (business rule enforcement point)
  const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: sellerId } });
  if (!sellerProfile?.isVerified) throw new Error("SELLER_NOT_VERIFIED");

  // Auction listing type validation
  if (data.listingType === "auction") {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category?.auctionAllowed) throw new Error("AUCTION_NOT_ALLOWED_FOR_CATEGORY");
  }

  const slug = generateUniqueSlug(data.title, Date.now().toString());

  return prisma.product.create({
    data: {
      sellerId,
      slug,
      ...data,
      status: "draft",
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, deletedAt: null, status: "active" },
    include: {
      images: true,
      category: true,
      subcategory: true,
      seller: { include: { profile: true, sellerProfile: true } },
    },
  });
}