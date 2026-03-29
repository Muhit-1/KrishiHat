"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Gavel, Clock, Package, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, isPast, format } from "date-fns";
import { cn } from "@/lib/utils/cn";

type AuctionStatus = "scheduled" | "active" | "ended";

const STATUS_TABS: { label: string; value: AuctionStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "🔴 Live", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Ended", value: "ended" },
];

function CountdownBadge({ endTime }: { endTime: string }) {
  const end = new Date(endTime);
  if (isPast(end)) {
    return <span className="text-xs text-muted-foreground">Ended</span>;
  }
  return (
    <span className="text-xs font-medium text-destructive flex items-center gap-1">
      <Clock className="h-3 w-3" />
      {formatDistanceToNow(end, { addSuffix: true })}
    </span>
  );
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | "">("");
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const fetchAuctions = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/auctions?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setAuctions(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchAuctions();
  }, [statusFilter, page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <PageContainer className="py-8">
      <SectionHeader
        title="Live Auctions"
        subtitle="Bid on used farming tools and equipment from verified sellers"
      />

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            size="sm"
            variant={statusFilter === tab.value ? "default" : "outline"}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <EmptyState
          icon={<Gavel className="h-12 w-12" />}
          title="No auctions found"
          description={
            statusFilter === "active"
              ? "No live auctions right now. Check back soon!"
              : "No auctions match your filter."
          }
          action={
            statusFilter !== "" ? (
              <Button onClick={() => setStatusFilter("")}>View All Auctions</Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction: any) => {
              const product = auction.product;
              const primaryImage =
                product?.images?.find((i: any) => i.isPrimary) ||
                product?.images?.[0];
              const isLive = auction.status === "active" && !isPast(new Date(auction.endTime));
              const topBid = auction.bids?.[0];

              return (
                <Card
                  key={auction.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={product?.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}

                    {/* Status badge overlay */}
                    <div className="absolute top-2 left-2">
                      {isLive ? (
                        <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          LIVE
                        </span>
                      ) : auction.status === "scheduled" ? (
                        <Badge variant="info" className="text-xs">Upcoming</Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">Ended</Badge>
                      )}
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                        {product?.category?.name}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Title */}
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2 leading-snug">
                        {product?.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {product?.condition} condition
                      </p>
                    </div>

                    {/* Bid info */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {auction.bids?.length > 0 ? "Current Bid" : "Starting Price"}
                        </span>
                        <span className="font-bold text-primary">
                          ৳ {Number(auction.currentPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Bids</span>
                        <span className="text-xs font-medium">{auction.bids?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {isPast(new Date(auction.endTime)) ? "Ended" : "Ends"}
                        </span>
                        <CountdownBadge endTime={auction.endTime} />
                      </div>
                    </div>

                    {/* Seller info */}
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">🌾</span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {auction.seller?.sellerProfile?.shopName || "Unknown Shop"}
                      </span>
                      {auction.seller?.sellerProfile?.isVerified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      )}
                    </div>

                    {/* CTA */}
                    <Link href={`/auction/${auction.id}`} className="block">
                      <Button
                        className="w-full"
                        variant={isLive ? "default" : "outline"}
                        size="sm"
                      >
                        <Gavel className="h-3.5 w-3.5 mr-2" />
                        {isLive
                          ? "Bid Now"
                          : auction.status === "scheduled"
                          ? "View Details"
                          : "View Result"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}