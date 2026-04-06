"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/common/page-container";
import {
  Sprout, ShoppingBag, Gavel, TrendingUp, Shield,
  Truck, BadgeCheck, ArrowRight, Package,
} from "lucide-react";
import { format } from "date-fns";
import { useT } from "@/providers/locale-provider";

// ── Serialisable prop types (no Prisma Decimal / Date objects) ──
interface CategoryProp {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  auctionAllowed: boolean;
  _count: { products: number };
}

interface ProductProp {
  id: string;
  title: string;
  slug: string;
  price: string;
  unit: string;
  images: { url: string }[];
  category: { name: string; slug: string } | null;
  seller: {
    sellerProfile: { shopName: string; isVerified: boolean } | null;
  } | null;
}

interface AuctionProp {
  id: string;
  currentPrice: string;
  endTime: string;
  product: {
    title: string;
    images: { url: string }[];
    category: { name: string } | null;
  } | null;
  seller: {
    sellerProfile: { shopName: string; isVerified: boolean } | null;
  } | null;
  _count: { bids: number };
}

interface MarketPriceProp {
  id: string;
  productName: string;
  minPrice: string;
  maxPrice: string;
  unit: string;
  market: string;
  recordedAt: string;
  category: { name: string; nameBn: string | null } | null;
}

interface HomeClientProps {
  featuredProducts: ProductProp[];
  liveAuctions: AuctionProp[];
  marketPrices: MarketPriceProp[];
  categories: CategoryProp[];
}

export default function HomeClient({
  featuredProducts,
  liveAuctions,
  marketPrices,
  categories,
}: HomeClientProps) {
  const t = useT();

  const features = [
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: t("home.features.direct_title"),
      desc: t("home.features.direct_desc"),
    },
    {
      icon: <Gavel className="h-6 w-6" />,
      title: t("home.features.auction_title"),
      desc: t("home.features.auction_desc"),
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t("home.features.prices_title"),
      desc: t("home.features.prices_desc"),
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t("home.features.verified_title"),
      desc: t("home.features.verified_desc"),
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: t("home.features.delivery_title"),
      desc: t("home.features.delivery_desc"),
    },
    {
      icon: <Sprout className="h-6 w-6" />,
      title: t("home.features.support_title"),
      desc: t("home.features.support_desc"),
    },
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="krishi-gradient text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <PageContainer className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm shadow-sm">
                🌾 {t("home.hero_badge")}
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                {t("home.hero_title")}
              </h1>

              <p className="text-xl text-white/90 mb-3">
                {t("home.hero_subtitle")}
              </p>

              <p className="text-base md:text-lg text-white/75 mb-8 max-w-xl">
                {t("app.tagline")}
              </p>

              <div className="flex gap-3 flex-wrap">
                <Link href="/marketplace">
                  <Button size="lg" variant="secondary" className="font-semibold shadow-lg">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    {t("home.explore_marketplace")}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute h-[320px] w-[320px] md:h-[420px] md:w-[420px] bg-primary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute h-[250px] w-[250px] bg-green-300/20 rounded-full blur-2xl translate-x-10 translate-y-10 -z-10" />
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
                <h2 className="text-2xl md:text-3xl font-bold">{t("home.browse_categories")}</h2>
                <p className="text-muted-foreground mt-1">{t("home.browse_categories_sub")}</p>
              </div>
              <Link href="/marketplace">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  {t("home.view_all")} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/marketplace?category=${cat.id}`}>
                  <div className="group aspect-square rounded-2xl border bg-card/90 backdrop-blur-sm p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-inner group-hover:bg-primary/15 transition-colors">
                      <Sprout className="h-7 w-7 text-primary" />
                    </div>
                    <p className="font-semibold text-sm md:text-base line-clamp-2">{cat.name}</p>
                    <p className="text-xs font-bengali text-muted-foreground mt-1 line-clamp-1">{cat.nameBn}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      {cat._count.products > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {cat._count.products} {t("home.products_found")}
                        </Badge>
                      )}
                      {cat.auctionAllowed && (
                        <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                          <Gavel className="h-3 w-3 mr-1" />
                          {t("home.features.auction_title")}
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
                <h2 className="text-2xl md:text-3xl font-bold">{t("home.featured_products")}</h2>
                <p className="text-muted-foreground mt-1">{t("home.featured_products_sub")}</p>
              </div>
              <Link href="/marketplace">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  {t("home.see_all")} <ArrowRight className="h-4 w-4 ml-1" />
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
                      <Badge variant="outline" className="text-xs mb-2">{product.category?.name}</Badge>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2 min-h-[40px]">{product.title}</h3>
                      <p className="text-primary font-bold text-base">
                        ৳ {Number(product.price).toFixed(2)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">/ {product.unit}</span>
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
                  <h2 className="text-2xl md:text-3xl font-bold">{t("home.live_auctions")}</h2>
                  <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    {t("auction.live")}
                  </span>
                </div>
                <p className="text-muted-foreground">{t("home.live_auctions_sub")}</p>
              </div>
              <Link href="/auctions">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  {t("home.all_auctions")} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {liveAuctions.map((auction) => (
                <Link key={auction.id} href={`/auctions/${auction.id}`}>
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
                          {t("auction.live")}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-3 min-h-[40px]">
                        {auction.product?.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{t("home.current_bid")}</span>
                          <span className="font-bold text-primary">
                            ৳ {Number(auction.currentPrice).toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{t("home.bids")}</span>
                          <span className="font-medium">{auction._count.bids}</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-4 shadow-sm">
                        <Gavel className="h-3.5 w-3.5 mr-1.5" />
                        {t("home.bid_now")}
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
                <h2 className="text-2xl md:text-3xl font-bold">{t("home.market_prices_title")}</h2>
                <p className="text-muted-foreground mt-1">
                  আজকের বাজার দর — {t("market_prices.subtitle")}
                </p>
              </div>
              <Link href="/market-prices">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  {t("home.full_price_list")} <ArrowRight className="h-4 w-4 ml-1" />
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
                      <Badge variant="outline" className="text-xs mt-1">{price.category?.name}</Badge>
                    </div>
                    <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 text-center bg-green-50 border border-green-200 rounded-xl p-2 shadow-sm">
                      <p className="text-xs text-green-700 font-medium">{t("market_prices.min_price")}</p>
                      <p className="text-sm font-bold text-green-800">৳{Number(price.minPrice).toFixed(0)}</p>
                    </div>
                    <div className="text-muted-foreground text-xs">–</div>
                    <div className="flex-1 text-center bg-red-50 border border-red-200 rounded-xl p-2 shadow-sm">
                      <p className="text-xs text-red-700 font-medium">{t("market_prices.max_price")}</p>
                      <p className="text-sm font-bold text-red-800">৳{Number(price.maxPrice).toFixed(0)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-muted-foreground">{t("market_prices.unit")} {price.unit}</p>
                    <p className="text-xs text-muted-foreground">{price.market}</p>
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
                  {t("home.view_all_market_prices")} <ArrowRight className="h-4 w-4 ml-1" />
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
            <h2 className="text-2xl md:text-3xl font-bold">{t("home.why_krishihat")}</h2>
            <p className="text-muted-foreground mt-2">{t("home.why_krishihat_sub")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="rounded-2xl border bg-card/95 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
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
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("home.seller_cta_title")}</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">{t("home.seller_cta_sub")}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/signup?role=seller">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg">
                  {t("home.become_seller")}
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" className="font-semibold border border-white/20 bg-white/15 text-white hover:bg-white/25 shadow-lg">
                  {t("home.browse_buyer")}
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}