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
  TrendingUp, Truck, AlertCircle, ClipboardList, Search,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/sellers", label: "Sellers", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/admin/categories", label: "Categories", icon: <Tag className="h-4 w-4" /> },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/admin/logistics", label: "Logistics", icon: <Truck className="h-4 w-4" /> },
  { href: "/admin/market-prices", label: "Market Prices", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/admin/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: <ClipboardList className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  pending: "warning", confirmed: "info", processing: "info",
  shipped: "default", delivered: "success", cancelled: "danger", refunded: "danger",
};

const paymentVariant: Record<string, any> = {
  pending: "warning", paid: "success", failed: "danger", refunded: "default",
};

const ORDER_STATUSES = ["", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (statusFilter) params.set("status", statusFilter);
    if (searchQuery) params.set("q", searchQuery);

    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setOrders(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, searchQuery]);

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Orders" subtitle={`${total} total orders`} />

      {/* Search */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchQuery(search)}
            placeholder="Search by order ID, buyer, seller..."
            className="w-full pl-9 pr-4 h-9 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button size="sm" onClick={() => setSearchQuery(search)}>Search</Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {ORDER_STATUSES.map((s) => (
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
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={<ShoppingBag className="h-12 w-12" />} title="No orders found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Order ID", "Buyer", "Seller", "Items", "Total", "Order Status", "Payment", "Shipment", "Date", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3 font-mono text-xs">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-3 py-3 text-xs">{order.buyer?.profile?.fullName || "—"}</td>
                  <td className="px-3 py-3 text-xs">{order.seller?.sellerProfile?.shopName || "—"}</td>
                  <td className="px-3 py-3 text-xs text-center">{order._count?.items || 0}</td>
                  <td className="px-3 py-3 font-bold text-primary text-xs">৳{Number(order.totalAmount).toFixed(0)}</td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant[order.status] || "default"} className="text-xs capitalize">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <Badge variant={paymentVariant[order.payment?.status] || "default"} className="text-xs">
                        {order.payment?.status || "—"}
                      </Badge>
                      <span className="text-xs text-muted-foreground uppercase">{order.payment?.method}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="outline" className="text-xs capitalize">
                      {order.shipment?.status?.replace(/_/g, " ") || "—"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(order.createdAt), "dd MMM yy")}
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs">View</Button>
                    </Link>
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