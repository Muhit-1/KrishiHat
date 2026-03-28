"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Package, ShoppingBag, CreditCard, Tag,
  TrendingUp, Truck, AlertCircle, ClipboardList,
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
  shipped: "default", delivered: "success", cancelled: "danger",
};

const paymentVariant: Record<string, any> = {
  pending: "warning", paid: "success", failed: "danger", refunded: "default",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => { if (json.success) setStats(json.data); })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, sub: `${stats.totalBuyers} buyers, ${stats.totalSellers} sellers`, icon: <Users className="h-5 w-5 text-blue-600" /> },
        { label: "Total Orders", value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, icon: <ShoppingBag className="h-5 w-5 text-yellow-600" /> },
        { label: "Total Revenue", value: `৳${stats.totalRevenue.toFixed(0)}`, sub: "from paid orders", icon: <CreditCard className="h-5 w-5 text-green-600" /> },
        { label: "Active Products", value: stats.activeProducts, sub: `${stats.totalProducts} total`, icon: <Package className="h-5 w-5 text-purple-600" /> },
        { label: "Pending Payments", value: stats.pendingPayments, sub: "awaiting confirmation", icon: <CreditCard className="h-5 w-5 text-orange-600" /> },
        { label: "In Transit", value: stats.inTransitShipments, sub: "shipments in progress", icon: <Truck className="h-5 w-5 text-primary" /> },
        { label: "Open Reports", value: stats.openReports, sub: "need review", icon: <AlertCircle className="h-5 w-5 text-red-600" /> },
      ]
    : [];

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Admin Dashboard" subtitle="Platform overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-28" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-20" /></CardContent>
              </Card>
            ))
          : statCards.map((card) => (
              <Card key={card.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !stats?.recentOrders?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {["Order ID", "Buyer", "Seller", "Total", "Status", "Payment", "Date"].map((h) => (
                      <th key={h} className="pb-2 text-left text-muted-foreground font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="py-2">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-primary hover:underline">
                          #{order.id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-2 text-xs">{order.buyer?.profile?.fullName || "—"}</td>
                      <td className="py-2 text-xs">{order.seller?.sellerProfile?.shopName || "—"}</td>
                      <td className="py-2 text-xs font-semibold text-primary">৳{Number(order.totalAmount).toFixed(0)}</td>
                      <td className="py-2">
                        <Badge variant={statusVariant[order.status] || "default"} className="text-xs capitalize">{order.status}</Badge>
                      </td>
                      <td className="py-2">
                        <Badge variant={paymentVariant[order.payment?.status] || "default"} className="text-xs">
                          {order.payment?.status || "—"}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">{format(new Date(order.createdAt), "dd MMM")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}