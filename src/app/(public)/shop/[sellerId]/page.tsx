"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { BadgeCheck, MessageSquare, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useT } from "@/providers/locale-provider";

export default function PublicShopPage({ params }: { params: { sellerId: string } }) {
  const t = useT();
  const { user } = useAuth();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [chatMsg, setChatMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/public/sellers/${params.sellerId}`).then((r) => r.json()),
      fetch(`/api/products?seller=${params.sellerId}&status=active`).then((r) => r.json()),
    ])
      .then(([shopJson, productsJson]) => {
        if (shopJson.success) setShop(shopJson.data);
        if (productsJson.success) setProducts(productsJson.data?.items || productsJson.data || []);
      })
      .finally(() => setLoading(false));
  }, [params.sellerId]);

  const handleMessageSeller = async () => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "buyer") { setChatMsg(t("shop.only_buyers")); setTimeout(() => setChatMsg(null), 3000); return; }
    setStartingChat(true);
    setChatMsg(null);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: params.sellerId }),
      });
      const json = await res.json();
      if (json.success) router.push("/buyer/chat");
      else { setChatMsg(json.message || t("errors.server_error")); setTimeout(() => setChatMsg(null), 3000); }
    } catch {
      setChatMsg(t("errors.network"));
      setTimeout(() => setChatMsg(null), 3000);
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!shop) {
    return (
      <PageContainer className="py-8">
        <div className="text-center py-20">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("shop.not_found")}</h2>
          <Link href="/marketplace">
            <Button>{t("shop.back")}</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {shop.shopLogoUrl ? (
                  <img src={shop.shopLogoUrl} alt={shop.shopName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">🌾</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold">{shop.shopName || "Unnamed Shop"}</h1>
                  {shop.isVerified ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {t("shop.verified")}
                    </Badge>
                  ) : (
                    <Badge variant="warning">{t("shop.unverified")}</Badge>
                  )}
                </div>
                {shop.user?.profile?.fullName && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t("shop.by")} {shop.user.profile.fullName}
                  </p>
                )}
                {shop.shopDescription && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{shop.shopDescription}</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {user?.role === "buyer" && (
                  <Button onClick={handleMessageSeller} isLoading={startingChat} variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {t("shop.message_seller")}
                  </Button>
                )}
                {!user && (
                  <Link href="/login">
                    <Button variant="outline" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {t("shop.login_to_chat")}
                    </Button>
                  </Link>
                )}
                {chatMsg && <p className="text-xs text-red-600">{chatMsg}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("shop.products_title")} ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border rounded-lg">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{t("shop.no_products")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: any) => {
                const primaryImage = product.images?.find((i: any) => i.isPrimary) || product.images?.[0];
                return (
                  <Link key={product.id} href={`/product/${product.slug}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <div className="aspect-square bg-muted overflow-hidden rounded-t-lg">
                        {primaryImage ? (
                          <img src={primaryImage.url} alt={product.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm truncate">{product.title}</p>
                        <p className="text-primary font-bold text-sm mt-1">
                          ৳{Number(product.price).toFixed(2)}
                          <span className="text-xs font-normal text-muted-foreground ml-1">/ {product.unit}</span>
                        </p>
                        <div className="mt-1.5">
                          <Badge variant={product.stock > 0 ? "success" : "danger"} className="text-xs">
                            {product.stock > 0 ? t("marketplace.stock") : t("product.out_of_stock")}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}