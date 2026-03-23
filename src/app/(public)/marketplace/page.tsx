"use client";

import { useState } from "react";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package } from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/features/marketplace/hooks/use-products";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const { data, loading } = useProducts({ q: query, limit: 20 });
  const products = data?.items ?? [];

  return (
    <PageContainer>
      <SectionHeader
        title="Marketplace"
        subtitle="Browse fresh products from verified farmers across Bangladesh"
      />

      {/* Search bar */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
            placeholder="Search products... (press Enter)"
            className="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button onClick={() => setQuery(search)}>Search</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon={<Package className="h-12 w-12" />} title="No products found" description="Try a different search or category." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <Link href={`/product/${product.slug}`} key={product.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="h-40 bg-muted rounded-md mb-3 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs mb-1">{product.category?.name}</Badge>
                  <h3 className="font-semibold text-sm line-clamp-2">{product.title}</h3>
                  <p className="text-primary font-bold mt-1">৳ {Number(product.price).toFixed(2)} / {product.unit}</p>
                  <p className="text-xs text-muted-foreground">{product.seller?.sellerProfile?.shopName}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}