import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/common/page-container";
import {
  Sprout,
  ShoppingBag,
  Gavel,
  TrendingUp,
  Shield,
  Truck,
  BadgeCheck,
  ArrowRight,
  Package,
} from "lucide-react";
import { format } from "date-fns";

// Server component — fetches data at request time
async function getFeaturedProducts() {
  return prisma.product.findMany({
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
}

async function getLiveAuctions() {
  return prisma.auction.findMany({
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
}

async function getLatestMarketPrices() {
  return prisma.marketPrice.findMany({
    take: 8,
    orderBy: { recordedAt: "desc" },
    include: {
      category: { select: { name: true, nameBn: true } },
    },
    distinct: ["productName"], // Show one record per product name
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
    include: {
      _count: { select: { products: true } },
    },
  });
}

async function getStats() {
  const [totalProducts, totalSellers, totalOrders] = await Promise.all([
    prisma.product.count({ where: { status: "active", deletedAt: null } }),
    prisma.user.count({
      where: {
        role: "seller",
        sellerProfile: { isVerified: true },
        deletedAt: null,
      },
    }),
    prisma.order.count({ where: { deletedAt: null } }),
  ]);
  return { totalProducts, totalSellers, totalOrders };
}

export default async function HomePage() {
  const [featuredProducts, liveAuctions, marketPrices, categories, stats] =
    await Promise.all([
      getFeaturedProducts(),
      getLiveAuctions(),
      getLatestMarketPrices(),
      getCategories(),
      getStats(),
    ]);

  const features = [
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Direct from Farmers",
      desc: "Buy fresh produce directly from verified farmers across Bangladesh",
    },
    {
      icon: <Gavel className="h-6 w-6" />,
      title: "Live Auctions",
      desc: "Bid on used farming tools and equipment at competitive prices",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Daily Market Prices",
      desc: "Stay updated with live commodity prices from major markets",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Sellers",
      desc: "All sellers are verified with NID and trade license checks",
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Delivery Tracking",
      desc: "Track your orders from pickup to doorstep in real time",
    },
    {
      icon: <Sprout className="h-6 w-6" />,
      title: "Supporting Farmers",
      desc: "Empowering Bangladeshi agriculture through digital commerce",
    },
  ];

  return (
    <>
      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="krishi-gradient text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <PageContainer className="relative">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm">
              🌾 Bangladesh&apos;s Agricultural Marketplace
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              মাঠ থেকে সরাসরি আপনার কাছে
            </h1>
            <p className="text-xl text-white/90 mb-3">
              Fresh from the Farm, Direct to You
            </p>
            <p className="text-base text-white/70 mb-8 max-w-lg">
              Buy and sell agricultural products, bid at live auctions, and check
              daily market prices across Bangladesh.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/marketplace">
                <Button size="lg" variant="secondary" className="font-semibold">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Explore Marketplace
                </Button>
              </Link>
              <Link href="/auctions">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 font-semibold"
                >
                  <Gavel className="h-5 w-5 mr-2" />
                  Live Auctions
                  {liveAuctions.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {liveAuctions.length}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── Platform Stats ────────────────────────────────── */}
      <section className="border-b bg-muted/30">
        <PageContainer>
          <div className="grid grid-cols-3 divide-x py-6">
            {[
              { label: "Active Products", value: stats.totalProducts, icon: "📦" },
              { label: "Verified Sellers", value: stats.totalSellers, icon: "✅" },
              { label: "Orders Placed", value: stats.totalOrders, icon: "🛒" },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── Browse Categories ─────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-14">
          <PageContainer>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Browse by Category</h2>
                <p className="text-muted-foreground mt-1">
                  Find exactly what you&apos;re looking for
                </p>
              </div>
              <Link href="/marketplace">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/marketplace?category=${cat.id}`}
                >
                  <div className="flex flex-col items-center text-center p-4 rounded-xl border bg-card hover:border-primary hover:shadow-sm transition-all cursor-pointer group">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <Sprout className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs font-bengali text-muted-foreground mt-0.5">
                      {cat.nameBn}
                    </p>
                    {cat._count.products > 0 && (
                      <Badge variant="outline" className="text-xs mt-2">
                        {cat._count.products} products
                      </Badge>
                    )}
                    {cat.auctionAllowed && (
                      <Badge className="text-xs mt-1 bg-amber-100 text-amber-700 border-amber-200">
                        <Gavel className="h-2.5 w-2.5 mr-1" />
                        Auction
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-14 bg-muted/20">
          <PageContainer>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Featured Products</h2>
                <p className="text-muted-foreground mt-1">
                  Popular picks from verified farmers
                </p>
              </div>
              <Link href="/marketplace">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  See All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group overflow-hidden">
                    <div className="h-44 bg-muted overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="text-xs mb-1">
                        {product.category?.name}
                      </Badge>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-primary font-bold">
                        ৳ {Number(product.price).toFixed(2)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          / {product.unit}
                        </span>
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-xs text-muted-foreground truncate">
                          {product.seller?.sellerProfile?.shopName}
                        </p>
                        {product.seller?.sellerProfile?.isVerified && (
                          <BadgeCheck className="h-3 w-3 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {/* ── Live Auctions ─────────────────────────────────── */}
      {liveAuctions.length > 0 && (
        <section className="py-14">
          <PageContainer>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">Live Auctions</h2>
                  <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-muted-foreground">Bid now before time runs out</p>
              </div>
              <Link href="/auctions">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  All Auctions <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveAuctions.map((auction) => (
                <Link key={auction.id} href={`/auction/${auction.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group overflow-hidden">
                    <div className="h-44 bg-muted overflow-hidden relative">
                      {auction.product?.images?.[0] ? (
                        <img
                          src={auction.product.images[0].url}
                          alt={auction.product?.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          LIVE
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                        {auction.product?.title}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Current Bid</span>
                          <span className="font-bold text-primary">
                            ৳ {Number(auction.currentPrice).toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Bids</span>
                          <span className="font-medium">{auction._count.bids}</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-3">
                        <Gavel className="h-3.5 w-3.5 mr-1.5" />
                        Bid Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {/* ── Today's Market Prices ─────────────────────────── */}
      {marketPrices.length > 0 && (
        <section className="py-14 bg-muted/20">
          <PageContainer>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Today&apos;s Market Prices</h2>
                <p className="text-muted-foreground mt-1">
                  আজকের বাজার দর — Live commodity prices
                </p>
              </div>
              <Link href="/market-prices">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Full Price List <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {marketPrices.map((price) => (
                <div
                  key={price.id}
                  className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{price.productName}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {price.category?.name}
                      </Badge>
                    </div>
                    <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 text-center bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-xs text-green-700 font-medium">Min</p>
                      <p className="text-sm font-bold text-green-800">
                        ৳{Number(price.minPrice).toFixed(0)}
                      </p>
                    </div>
                    <div className="text-muted-foreground text-xs">–</div>
                    <div className="flex-1 text-center bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-700 font-medium">Max</p>
                      <p className="text-sm font-bold text-red-800">
                        ৳{Number(price.maxPrice).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">per {price.unit}</p>
                    <p className="text-xs text-muted-foreground">{price.market}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(price.recordedAt), "dd MMM yyyy")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link href="/market-prices">
                <Button variant="outline" size="sm">
                  View All Market Prices <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </PageContainer>
        </section>
      )}

      {/* ── Why KrishiHat ─────────────────────────────────── */}
      <section className="py-14">
        <PageContainer>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">Why Choose KrishiHat?</h2>
            <p className="text-muted-foreground mt-2">
              Built for Bangladeshi farmers and buyers
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-primary mb-3">{f.icon}</div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── Seller CTA ────────────────────────────────────── */}
      <section className="krishi-gradient text-white py-16">
        <PageContainer className="text-center">
          <Sprout className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">
            Ready to Start Selling?
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Join thousands of farmers already selling on KrishiHat. It&apos;s
            free to register.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup?role=seller">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold"
              >
                Become a Seller
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Browse as Buyer
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>
    </>
  );
}