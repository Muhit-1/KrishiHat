"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/features/marketplace/hooks/use-products";
import { cn } from "@/lib/utils/cn";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data, loading } = useProducts({
    q: query || undefined,
    category: selectedCategory || undefined,
    condition: condition || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    limit: 24,
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategories(json.data); });
  }, []);

  const clearFilters = () => {
    setSelectedCategory("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    setQuery("");
    setSearch("");
  };

  const hasFilters = selectedCategory || condition || minPrice || maxPrice || query;

  return (
    <div className="min-h-screen">
      <PageContainer>
        <SectionHeader
          title="Marketplace"
          subtitle={total > 0 ? `${total} products found` : "Browse fresh products from verified farmers"}
        />

        {/* Search */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setQuery(search); }}
              placeholder="Search products... (press Enter)"
              className="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button onClick={() => setQuery(search)} variant="default">Search</Button>
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasFilters && <span className="ml-1.5 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
          </Button>
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-muted/40 border rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="h-9 px-2 rounded-md border border-input text-sm bg-background"
              >
                <option value="">Any condition</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Min Price (৳)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="h-9 px-2 rounded-md border border-input text-sm bg-background"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Max Price (৳)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="9999"
                className="h-9 px-2 rounded-md border border-input text-sm bg-background"
              />
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Category sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    !selectedCategory ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {cat.name}
                    {cat.auctionAllowed && (
                      <span className="ml-1 text-xs opacity-70">(Auction)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile category strip */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-2 w-full">
            <button
              onClick={() => setSelectedCategory("")}
              className={cn("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                !selectedCategory ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-muted")}
            >All</button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-muted")}
              >{cat.name}</button>
            ))}
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={<Package className="h-12 w-12" />}
                title="No products found"
                description="Try different filters or search terms."
                action={hasFilters ? <Button onClick={clearFilters}>Clear Filters</Button> : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product: any) => (
                  <Link href={`/product/${product.slug}`} key={product.id}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="h-44 bg-muted rounded-md mb-3 overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col">
                          <Badge variant="outline" className="text-xs w-fit mb-1">{product.category?.name}</Badge>
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.title}</h3>
                          <p className="text-primary font-bold mt-auto">
                            ৳ {Number(product.price).toFixed(2)}
                            <span className="text-xs font-normal text-muted-foreground ml-1">/ {product.unit}</span>
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {product.seller?.sellerProfile?.shopName || ""}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}