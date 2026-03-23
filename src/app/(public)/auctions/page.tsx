import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuctionsPage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Live Auctions"
        subtitle="Bid on used farming tools and equipment"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-40 w-full rounded" />
              <Badge variant="warning">Live</Badge>
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Bid</span>
                <span className="font-bold text-primary">৳ 0</span>
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}