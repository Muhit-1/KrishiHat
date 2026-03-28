"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, Package, BadgeCheck, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/hooks/use-cart";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState<string | null>(null);

  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/products/slug/${params.slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProduct(json.data);
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "buyer") {
      setCartMsg("Only buyers can add to cart");
      return;
    }
    setAddingToCart(true);
    setCartMsg(null);
    const res = await addItem(product.id, quantity);
    if (res.success) {
      setCartMsg("Added to cart!");
    } else {
      setCartMsg(res.message || "Failed to add to cart");
    }
    setAddingToCart(false);
    setTimeout(() => setCartMsg(null), 3000);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-80 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <div className="text-center py-20">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Link href="/marketplace"><Button>Back to Marketplace</Button></Link>
        </div>
      </PageContainer>
    );
  }

  const images = product.images || [];
  const primaryImage = images.find((i: any) => i.isPrimary) || images[0];

  return (
    <PageContainer className="py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
        <span>/</span>
        <Link href={`/marketplace?category=${product.category?.id}`} className="hover:text-foreground">{product.category?.name}</Link>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]?.url || primaryImage?.url}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Package className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 rounded border-2 overflow-hidden ${i === selectedImage ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{product.category?.name}</Badge>
            <Badge variant={product.condition === "new" ? "success" : "warning"} className="capitalize">
              {product.condition}
            </Badge>
            <Badge variant={product.stock > 0 ? "success" : "danger"}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold">{product.title}</h1>
          {product.titleBn && <p className="text-base text-muted-foreground font-bengali">{product.titleBn}</p>}

          <div className="text-3xl font-bold text-primary">
            ৳ {Number(product.price).toFixed(2)}
            <span className="text-base font-normal text-muted-foreground ml-1">/ {product.unit}</span>
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Quantity:</label>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 hover:bg-muted transition-colors"
                >−</button>
                <span className="px-4 py-1.5 font-medium text-sm border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-1.5 hover:bg-muted transition-colors"
                >+</button>
              </div>
              <span className="text-xs text-muted-foreground">Max: {product.stock}</span>
            </div>
          )}

          {cartMsg && (
            <p className={`text-sm px-3 py-2 rounded-md ${cartMsg.includes("Added") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {cartMsg}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              isLoading={addingToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            {user?.role === "buyer" && product.stock > 0 && (
              <Link href="/buyer/checkout" className="flex-1">
                <Button variant="outline" className="w-full">Buy Now</Button>
              </Link>
            )}
          </div>

          {/* Seller info */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {product.seller?.sellerProfile?.shopLogoUrl ? (
                  <img src={product.seller.sellerProfile.shopLogoUrl} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span>🌾</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm">{product.seller?.sellerProfile?.shopName || "—"}</p>
                  {product.seller?.sellerProfile?.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{product.seller?.profile?.fullName}</p>
              </div>
              <Link href={`/marketplace?seller=${product.seller?.id}`}>
                <Button size="sm" variant="outline" className="h-7 text-xs">View Shop</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}