import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function MarketplacePage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Marketplace"
        subtitle="Browse fresh products from verified farmers across Bangladesh"
      />

      {/* Search & Filter Bar */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="outline">All Categories</Button>
        <Button variant="outline">Sort By</Button>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Product Grid (placeholder) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </PageContainer>
  );
}