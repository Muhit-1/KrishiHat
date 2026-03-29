"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import {
  Users, Package, ShoppingBag, CreditCard, Tag,
  TrendingUp, Truck, AlertCircle, ClipboardList, Gavel,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/sellers", label: "Sellers", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/admin/categories", label: "Categories", icon: <Tag className="h-4 w-4" /> },
  { href: "/admin/auctions", label: "Auctions", icon: <Gavel className="h-4 w-4" /> },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/admin/logistics", label: "Logistics", icon: <Truck className="h-4 w-4" /> },
  { href: "/admin/market-prices", label: "Market Prices", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/admin/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: <ClipboardList className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  scheduled: "info", active: "warning", ended: "default", cancelled: "danger",
};

const AUCTION_STATUSES = ["", "scheduled", "active", "ended", "cancelled"];

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [ending, setEnding] = useState<string | null>(null);

  const fetchAuctions = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
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

  useEffect(() => { fetchAuctions(); }, [statusFilter]);

  const handleEndAuction = async (id: string) => {
    if (!confirm("Force end this auction now?")) return;
    setEnding(id);
    await fetch(`/api/auctions/${id}/end`, { method: "POST" });
    setEnding(null);
    fetchAuctions();
  };

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Auctions" subtitle={`${total} auctions`} />

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {AUCTION_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            className="capitalize text-xs"
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : auctions.length === 0 ? (
        <EmptyState icon={<Gavel className="h-12 w-12" />} title="No auctions found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Product", "Seller", "Start ৳", "Current ৳", "Bids", "Status", "Start Time", "End Time", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {auctions.map((auction: any) => (
                <tr key={auction.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3">
                    <p className="font-medium text-xs truncate max-w-[130px]">
                      {auction.product?.title || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {auction.seller?.sellerProfile?.shopName || "—"}
                  </td>
                  <td className="px-3 py-3 text-xs">৳{Number(auction.startPrice).toFixed(0)}</td>
                  <td className="px-3 py-3 font-bold text-primary text-xs">
                    ৳{Number(auction.currentPrice).toFixed(0)}
                  </td>
                  <td className="px-3 py-3 text-center text-xs">{auction.bids?.length || 0}</td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant[auction.status] || "default"} className="text-xs capitalize">
                      {auction.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(auction.startTime), "dd MMM, HH:mm")}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(auction.endTime), "dd MMM, HH:mm")}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <Link href={`/auction/${auction.id}`}>
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs">View</Button>
                      </Link>
                      {(auction.status === "active" || auction.status === "scheduled") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 px-2 text-xs"
                          isLoading={ending === auction.id}
                          onClick={() => handleEndAuction(auction.id)}
                        >
                          End
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}