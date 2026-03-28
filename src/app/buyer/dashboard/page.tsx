"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ShoppingCart, CheckCircle, Clock, MapPin, MessageSquare, Flag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { format } from "date-fns";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/reports", label: "Reports", icon: <Flag className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  pending: "warning", confirmed: "info", processing: "info",
  shipped: "default", delivered: "success", cancelled: "danger", refunded: "danger",
};

export default function BuyerDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/buyer/stats")
      .then((r) => r.json())
      .then((json) => { if (json.success) setStats(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader
        title="Dashboard"
        subtitle={`Welcome back${profile?.fullName ? `, ${profile.fullName}` : ""}!`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats?.totalOrders, icon: <ShoppingBag className="h-5 w-5 text-primary" /> },
          { label: "Pending Orders", value: stats?.pendingOrders, icon: <Clock className="h-5 w-5 text-yellow-600" /> },
          { label: "Delivered", value: stats?.deliveredOrders, icon: <CheckCircle className="h-5 w-5 text-green-600" /> },
          { label: "Cart Items", value: stats?.cartItemCount, icon: <ShoppingCart className="h-5 w-5 text-blue-600" /> },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value ?? 0}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Link href="/buyer/orders" className="text-sm text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !stats?.recentOrders?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {["Order ID", "Shop", "Items", "Total", "Status", "Date"].map((h) => (
                      <th key={h} className="pb-2 text-left text-muted-foreground font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="py-2 font-mono text-xs">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="py-2">{order.seller?.sellerProfile?.shopName || "—"}</td>
                      <td className="py-2 text-muted-foreground">{order.items?.length} item(s)</td>
                      <td className="py-2 font-semibold text-primary">৳{Number(order.totalAmount).toFixed(0)}</td>
                      <td className="py-2">
                        <Badge variant={statusVariant[order.status] || "default"} className="text-xs">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">
                        {format(new Date(order.createdAt), "dd MMM")}
                      </td>
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