"use client";

import { useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Gavel, Clock, Package, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow, isPast } from "date-fns";

function useCountdown(endTime: string | null) {
  const [timeLeft, setTimeLeft] = useState<string>("—");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const tick = () => {
      const end = new Date(endTime);
      if (isPast(end)) {
        setTimeLeft("Ended");
        setIsEnded(true);
        return;
      }
      setTimeLeft(formatDistanceToNow(end, { addSuffix: true }));
    };

    tick();
    const id = setInterval(tick, 10000); // update every 10s
    return () => clearInterval(id);
  }, [endTime]);

  return { timeLeft, isEnded };
}

export default function AuctionDetailPage({ params }: { params: { id: string } }) {
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [bidMsg, setBidMsg] = useState<{ text: string; success: boolean } | null>(null);
  const { user } = useAuth();

  const { timeLeft, isEnded } = useCountdown(auction?.endTime || null);

  const fetchAuction = useCallback(async () => {
    const res = await fetch(`/api/auctions/${params.id}`);
    const json = await res.json();
    if (json.success) setAuction(json.data);
    setLoading(false);
  }, [params.id]);

  useEffect(() => { fetchAuction(); }, [fetchAuction]);

  // Auto-refresh bids every 15 seconds while auction is active
  useEffect(() => {
    if (!auction || auction.status !== "active") return;
    const id = setInterval(fetchAuction, 15000);
    return () => clearInterval(id);
  }, [auction, fetchAuction]);

  const handleBid = async () => {
    if (!user) { window.location.href = "/login"; return; }
    const amount = Number(bidAmount);
    if (!amount || isNaN(amount)) { setBidMsg({ text: "Enter a valid bid amount", success: false }); return; }

    setBidding(true);
    setBidMsg(null);

    const res = await fetch(`/api/auctions/${params.id}/bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const json = await res.json();

    if (json.success) {
      setBidMsg({ text: "Bid placed successfully!", success: true });
      setBidAmount("");
      fetchAuction(); // Refresh auction data
    } else {
      setBidMsg({ text: json.message || "Bid failed", success: false });
    }
    setBidding(false);
    setTimeout(() => setBidMsg(null), 5000);
  };

  const minBid = auction
    ? Number(auction.currentPrice) + Number(auction.minIncrement)
    : 0;

  if (loading) {
    return (
      <PageContainer>
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-80 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!auction) {
    return (
      <PageContainer>
        <div className="text-center py-20">
          <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Auction not found</h2>
          <Link href="/auctions"><Button>Back to Auctions</Button></Link>
        </div>
      </PageContainer>
    );
  }

  const product = auction.product;
  const images = product?.images || [];

  return (
    <PageContainer className="py-8">
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link href="/auctions" className="hover:text-foreground">Auctions</Link>
        <span>/</span>
        <span className="text-foreground">{product?.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product image */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
            {images.length > 0 ? (
              <img src={images[0].url} alt={product?.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Package className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Auction info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={auction.status === "active" ? "warning" : auction.status === "ended" ? "default" : "info"}>
              {auction.status === "active" ? "🔴 Live" : auction.status === "ended" ? "Ended" : "Scheduled"}
            </Badge>
            <Badge variant="outline">{product?.category?.name}</Badge>
            <Badge variant="outline" className="capitalize">{product?.condition}</Badge>
          </div>

          <h1 className="text-2xl font-bold">{product?.title}</h1>

          {/* Bid stats */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Bid</span>
              <span className="text-2xl font-bold text-primary">৳ {Number(auction.currentPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Starting Price</span>
              <span className="font-medium">৳ {Number(auction.startPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Min Increment</span>
              <span className="font-medium">৳ {Number(auction.minIncrement).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {isEnded ? "Ended" : "Ends"}
              </span>
              <span className={`font-medium ${isEnded ? "text-muted-foreground" : "text-destructive"}`}>
                {timeLeft}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">End Date</span>
              <span className="text-sm">{format(new Date(auction.endTime), "dd MMM yyyy, hh:mm a")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Bids</span>
              <span className="font-medium">{auction.bids?.length || 0}</span>
            </div>
          </div>

          {/* Bid form */}
          {auction.status === "active" && !isEnded && (
            <div className="space-y-3">
              {user?.role === "buyer" ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Minimum bid: <span className="font-semibold text-foreground">৳ {minBid.toFixed(2)}</span>
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min ৳${minBid}`}
                      min={minBid}
                      step="1"
                      className="flex-1 h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button onClick={handleBid} isLoading={bidding} disabled={!bidAmount}>
                      <Gavel className="h-4 w-4 mr-2" />
                      Place Bid
                    </Button>
                  </div>
                  {bidMsg && (
                    <p className={`text-sm px-3 py-2 rounded-md ${bidMsg.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {bidMsg.text}
                    </p>
                  )}
                </>
              ) : !user ? (
                <Link href="/login">
                  <Button className="w-full">Login to Bid</Button>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                  Only buyers can place bids.
                </p>
              )}
            </div>
          )}

          {auction.status === "ended" && auction.winnerId && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p className="font-semibold text-sm">Auction Ended</p>
              <p className="text-xs mt-1">Final price: ৳ {Number(auction.currentPrice).toFixed(2)}</p>
            </div>
          )}

          {/* Seller info */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span>🌾</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-medium text-sm">{product?.seller?.sellerProfile?.shopName || "—"}</p>
                  {product?.seller?.sellerProfile?.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bid History */}
      {auction.bids?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Bid History ({auction.bids.length})</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {["Bidder", "Amount", "Time"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {auction.bids.map((bid: any, i: number) => (
                  <tr key={bid.id} className={i === 0 ? "bg-green-50" : "hover:bg-muted/30"}>
                    <td className="px-4 py-3">
                      {bid.bidder?.profile?.fullName || "Bidder"}
                      {i === 0 && <span className="ml-2 text-xs text-green-700 font-medium">Highest</span>}
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">৳ {Number(bid.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{format(new Date(bid.createdAt), "dd MMM, hh:mm a")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}