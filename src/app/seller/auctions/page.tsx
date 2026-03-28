"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { auctionSchema, type AuctionInput } from "@/lib/validations/auction.schema";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingBag, Gavel, MessageSquare, BarChart2, User, BadgeCheck, FileText } from "lucide-react";
import { format } from "date-fns";

const sellerLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/seller/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/seller/auctions", label: "Auctions", icon: <Gavel className="h-4 w-4" /> },
  { href: "/seller/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/seller/quotes", label: "Quotes", icon: <FileText className="h-4 w-4" /> },
  { href: "/seller/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/seller/verification", label: "Verification", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/seller/profile", label: "Shop Profile", icon: <User className="h-4 w-4" /> },
  { href: "/seller/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  scheduled: "info", active: "warning", ended: "default", cancelled: "danger",
};

export default function SellerAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [eligibleProducts, setEligibleProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AuctionInput>({
    resolver: zodResolver(auctionSchema),
  });

  const fetchAuctions = () => {
    fetch("/api/seller/auctions")
      .then((r) => r.json())
      .then((json) => { if (json.success) setAuctions(json.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAuctions();
    // Fetch eligible products (auction-allowed categories, no existing auction)
    fetch("/api/seller/products?status=active")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          // Filter products with auctionAllowed category and no auction yet
          setEligibleProducts(json.data.items.filter((p: any) => p.category?.auctionAllowed && !p.auction));
        }
      });
  }, []);

  const onSubmit = async (data: AuctionInput) => {
    setServerError(null);
    const res = await fetch("/api/auctions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      reset();
      setIsModalOpen(false);
      fetchAuctions();
    } else {
      setServerError(json.message);
    }
  };

  const handleEnd = async (id: string) => {
    if (!confirm("End this auction now?")) return;
    await fetch(`/api/auctions/${id}/end`, { method: "POST" });
    fetchAuctions();
  };

  // Default datetime values for the form (now + 1 hour, now + 24 hours)
  const defaultStart = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultEnd = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <SectionHeader
        title="My Auctions"
        action={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>+ Create Auction</Button>
        }
      />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : auctions.length === 0 ? (
        <EmptyState
          icon={<Gavel className="h-12 w-12" />}
          title="No auctions yet"
          description="Only products in auction-enabled categories (e.g. Farming Tools) can be listed for auction."
          action={<Button onClick={() => setIsModalOpen(true)}>Create Auction</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Product", "Start Price", "Current Price", "Bids", "Status", "End Time", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {auctions.map((a: any) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium truncate max-w-[160px]">{a.product?.title}</td>
                  <td className="px-4 py-3">৳{Number(a.startPrice).toFixed(0)}</td>
                  <td className="px-4 py-3 font-bold text-primary">৳{Number(a.currentPrice).toFixed(0)}</td>
                  <td className="px-4 py-3">{a.bids?.length || 0}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[a.status] || "default"} className="capitalize">{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(a.endTime), "dd MMM, hh:mm a")}</td>
                  <td className="px-4 py-3">
                    {(a.status === "active" || a.status === "scheduled") && (
                      <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleEnd(a.id)}>
                        End
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Auction Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setServerError(null); reset(); }} title="Create Auction">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Product *</label>
            <select {...register("productId")} className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select product</option>
              {eligibleProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            {errors.productId && <p className="text-xs text-destructive">{errors.productId.message}</p>}
            {eligibleProducts.length === 0 && (
              <p className="text-xs text-muted-foreground">No eligible products. Make sure you have active products in auction-allowed categories.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Starting Price (৳)" type="number" step="0.01" error={errors.startPrice?.message} {...register("startPrice")} />
            <Input label="Min Increment (৳)" type="number" step="0.01" defaultValue="10" error={errors.minIncrement?.message} {...register("minIncrement")} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Start Time *</label>
            <input
              type="datetime-local"
              defaultValue={defaultStart}
              {...register("startTime")}
              className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">End Time *</label>
            <input
              type="datetime-local"
              defaultValue={defaultEnd}
              {...register("endTime")}
              className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
          </div>

          {serverError && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{serverError}</p>}

          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">Create Auction</Button>
            <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); reset(); setServerError(null); }}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}