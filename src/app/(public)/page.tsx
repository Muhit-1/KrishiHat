import { prisma } from "@/lib/db/prisma";
import HomeClient from "./home-client";

// Server-side data fetching

async function getFeaturedProducts() {
  const rows = await prisma.product.findMany({
    where: { status: "active", deletedAt: null },
    take: 8,
    orderBy: { viewCount: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
      seller: {
        include: {
          sellerProfile: { select: { shopName: true, isVerified: true } },
        },
      },
    },
  });

  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price.toString(),
    unit: p.unit,
    images: p.images.map((i) => ({ url: i.url })),
    category: p.category
      ? { name: p.category.name, slug: p.category.slug }
      : null,
    seller: p.seller
      ? {
          sellerProfile: p.seller.sellerProfile
            ? {
                shopName: p.seller.sellerProfile.shopName,
                isVerified: p.seller.sellerProfile.isVerified,
              }
            : null,
        }
      : null,
  }));
}

async function getLiveAuctions() {
  const rows = await prisma.auction.findMany({
    where: { status: "active" },
    take: 4,
    orderBy: { endTime: "asc" },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true } },
        },
      },
      seller: {
        include: {
          sellerProfile: { select: { shopName: true, isVerified: true } },
        },
      },
      _count: { select: { bids: true } },
    },
  });

  return rows.map((a) => ({
    id: a.id,
    currentPrice: a.currentPrice.toString(),
    endTime: a.endTime.toISOString(),
    product: a.product
      ? {
          title: a.product.title,
          images: a.product.images.map((i) => ({ url: i.url })),
          category: a.product.category
            ? { name: a.product.category.name }
            : null,
        }
      : null,
    seller: a.seller
      ? {
          sellerProfile: a.seller.sellerProfile
            ? {
                shopName: a.seller.sellerProfile.shopName,
                isVerified: a.seller.sellerProfile.isVerified,
              }
            : null,
        }
      : null,
    _count: { bids: a._count.bids },
  }));
}

async function getLatestMarketPrices() {
  const rows = await prisma.marketPrice.findMany({
    take: 8,
    orderBy: { recordedAt: "desc" },
    include: {
      category: { select: { name: true, nameBn: true } },
    },
    distinct: ["productName"],
  });

  return rows.map((r) => ({
    id: r.id,
    productName: r.productName,
    minPrice: r.minPrice.toString(),
    maxPrice: r.maxPrice.toString(),
    unit: r.unit,
    market: r.market,
    recordedAt: r.recordedAt.toISOString(),
    category: r.category
      ? { name: r.category.name, nameBn: r.category.nameBn }
      : null,
  }));
}

async function getCategories() {
  const rows = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
    include: {
      _count: { select: { products: true } },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    nameBn: c.nameBn,
    slug: c.slug,
    auctionAllowed: c.auctionAllowed,
    _count: { products: c._count.products },
  }));
}

export default async function HomePage() {
  const [featuredProducts, liveAuctions, marketPrices, categories] =
    await Promise.all([
      getFeaturedProducts(),
      getLiveAuctions(),
      getLatestMarketPrices(),
      getCategories(),
    ]);

  return (
    <HomeClient
      featuredProducts={featuredProducts}
      liveAuctions={liveAuctions}
      marketPrices={marketPrices}
      categories={categories}
    />
  );
}