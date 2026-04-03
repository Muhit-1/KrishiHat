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
    distinct: ["productName"],
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

export default async function HomePage() {
  const [featuredProducts, liveAuctions, marketPrices, categories] =
    await Promise.all([
      getFeaturedProducts(),
      getLiveAuctions(),
      getLatestMarketPrices(),
      getCategories(),
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
      <section className="krishi-gradient text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <PageContainer className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left Content */}
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm shadow-sm">
                🌾 Bangladesh&apos;s Agricultural Marketplace
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                মাঠ থেকে সরাসরি আপনার কাছে
              </h1>

              <p className="text-xl text-white/90 mb-3">
                Fresh from the Farm, Direct to You
              </p>

              <p className="text-base md:text-lg text-white/75 mb-8 max-w-xl">
                Buy and sell agricultural products, bid at live auctions, and
                check daily market prices across Bangladesh.
              </p>

              <div className="flex gap-3 flex-wrap">
                <Link href="/marketplace">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="font-semibold shadow-lg"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image / GIF */}
            <div className="relative flex items-center justify-center">

              {/* Blob background */}
              <div className="absolute h-[320px] w-[320px] md:h-[420px] md:w-[420px] bg-primary/20 rounded-full blur-3xl -z-10" />

              {/* Optional second blob for depth */}
              <div className="absolute h-[250px] w-[250px] bg-green-300/20 rounded-full blur-2xl translate-x-10 translate-y-10 -z-10" />

              {/* Image only (no border, no box) */}
              <img
                src="/hero_pic.gif"
                alt="KrishiHat Hero"
                className="relative z-10 max-h-[320px] md:max-h-[420px] w-auto object-contain drop-shadow-2xl"
              />

            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── Browse Categories ─────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16 relative">
          <PageContainer>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Browse by Category
                </h2>
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/marketplace?category=${cat.id}`}>
                  <div className="group aspect-square rounded-2xl border bg-card/90 backdrop-blur-sm p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 
                  hover:border-primary/40 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-inner group-hover:bg-primary/15 transition-colors">
                      <Sprout className="h-7 w-7 text-primary" />
                    </div>

                    <p className="font-semibold text-sm md:text-base line-clamp-2">
                      {cat.name}
                    </p>

                    <p className="text-xs font-bengali text-muted-foreground mt-1 line-clamp-1">
                      {cat.nameBn}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      {cat._count.products > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {cat._count.products} products
                        </Badge>
                      )}

                      {cat.auctionAllowed && (
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-200 bg-amber-50 text-amber-700"
                        >
                          <Gavel className="h-3 w-3 mr-1" />
                          Auction
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-muted/20 relative">
          <PageContainer>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Featured Products
                </h2>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`}>
                  <Card className="h-full overflow-hidden border bg-card/95 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group rounded-2xl">
                    <div className="h-44 bg-muted overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <Badge variant="outline" className="text-xs mb-2">
                        {product.category?.name}
                      </Badge>

                      <h3 className="font-semibold text-sm line-clamp-2 mb-2 min-h-[40px]">
                        {product.title}
                      </h3>

                      <p className="text-primary font-bold text-base">
                        ৳ {Number(product.price).toFixed(2)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          / {product.unit}
                        </span>
                      </p>

                      <div className="flex items-center gap-1 mt-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {product.seller?.sellerProfile?.shopName}
                        </p>
                        {product.seller?.sellerProfile?.isVerified && (
                          <BadgeCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
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
        <section className="py-16 relative">
          <PageContainer>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Live Auctions
                  </h2>
                  <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Bid now before time runs out
                </p>
              </div>
              <Link href="/auctions">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  All Auctions <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {liveAuctions.map((auction) => (
                <Link key={auction.id} href={`/auction/${auction.id}`}>
                  <Card className="h-full overflow-hidden border bg-card/95 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group rounded-2xl">
                    <div className="h-44 bg-muted overflow-hidden relative">
                      {auction.product?.images?.[0] ? (
                        <img
                          src={auction.product.images[0].url}
                          alt={auction.product?.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}

                      <div className="absolute top-2 left-2">
                        <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          LIVE
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-3 min-h-[40px]">
                        {auction.product?.title}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Current Bid
                          </span>
                          <span className="font-bold text-primary">
                            ৳ {Number(auction.currentPrice).toFixed(0)}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Bids</span>
                          <span className="font-medium">
                            {auction._count.bids}
                          </span>
                        </div>
                      </div>

                      <Button size="sm" className="w-full mt-4 shadow-sm">
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
        <section className="py-16 bg-muted/20 relative">
          <PageContainer>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Today&apos;s Market Prices
                </h2>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketPrices.map((price) => (
                <div
                  key={price.id}
                  className="rounded-2xl border bg-card/95 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
                    <div className="flex-1 text-center bg-green-50 border border-green-200 rounded-xl p-2 shadow-sm">
                      <p className="text-xs text-green-700 font-medium">Min</p>
                      <p className="text-sm font-bold text-green-800">
                        ৳{Number(price.minPrice).toFixed(0)}
                      </p>
                    </div>
                    <div className="text-muted-foreground text-xs">–</div>
                    <div className="flex-1 text-center bg-red-50 border border-red-200 rounded-xl p-2 shadow-sm">
                      <p className="text-xs text-red-700 font-medium">Max</p>
                      <p className="text-sm font-bold text-red-800">
                        ৳{Number(price.maxPrice).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-muted-foreground">
                      per {price.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {price.market}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(price.recordedAt), "dd MMM yyyy")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link href="/market-prices">
                <Button variant="outline" size="sm" className="shadow-sm">
                  View All Market Prices <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </PageContainer>
        </section>
      )}

      {/* ── Why KrishiHat ─────────────────────────────────── */}
      <section className="py-16 relative">
        <PageContainer>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              Why Choose KrishiHat?
            </h2>
            <p className="text-muted-foreground mt-2">
              Built for Bangladeshi farmers and buyers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card
                key={f.title}
                className="rounded-2xl border bg-card/95 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── Seller CTA ────────────────────────────────────── */}
      <section className="krishi-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-1/4 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

        <PageContainer className="relative">
          <div className="max-w-3xl mx-auto text-center rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-md px-6 py-10 shadow-2xl">
            <Sprout className="h-12 w-12 mx-auto mb-4 opacity-90" />

            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Ready to Start Selling?
            </h2>

            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Join thousands of farmers already selling on KrishiHat.
              It&apos;s free to register.
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/signup?role=seller">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold shadow-lg"
                >
                  Become a Seller
                </Button>
              </Link>

              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="font-semibold border border-white/20 bg-white/15 text-white hover:bg-white/25 shadow-lg"
                >
                  Browse as Buyer
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}