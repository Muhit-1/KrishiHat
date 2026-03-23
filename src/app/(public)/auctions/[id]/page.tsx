import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuctionDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageContainer>
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="h-80 w-full rounded-lg" />
        <div className="space-y-4">
          <Badge variant="warning">Live Auction</Badge>
          <h1 className="text-2xl font-bold">Auction #{params.id}</h1>
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between"><span>Current Bid</span><span className="font-bold text-primary">৳ 0</span></div>
            <div className="flex justify-between"><span>Min Increment</span><span>৳ 10</span></div>
            <div className="flex justify-between"><span>Ends In</span><span className="text-destructive font-medium">--:--:--</span></div>
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Your bid" className="flex-1 h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <Button>Place Bid</Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}