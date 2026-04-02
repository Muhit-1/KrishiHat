"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingBag, Gavel, MessageSquare, BarChart2, User, BadgeCheck, FileText, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { format } from "date-fns";

const sellerLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/seller/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/seller/auctions", label: "Auctions", icon: <Gavel className="h-4 w-4" /> },
  { href: "/seller/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/seller/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/seller/verification", label: "Verification", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/seller/profile", label: "Shop Profile", icon: <User className="h-4 w-4" /> },
  { href: "/seller/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  pending: "warning", confirmed: "info", processing: "info",
  shipped: "default", delivered: "success", cancelled: "danger",
};

export default function SellerDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/stats")
      .then((r) => r.json())
      .then((json) => { if (json.success) setStats(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <SectionHeader
        title="Seller Dashboard"
        subtitle={`Welcome back${profile?.fullName ? `, ${profile.fullName}` : ""}!`}
      />

      {/* Unverified warning */}
      {!loading && stats && !stats.isVerified && (
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Seller verification required</p>
            <p className="text-xs mt-0.5">
              You need to complete verification before publishing products.{" "}
              <Link href="/seller/verification" className="underline font-medium">Complete now →</Link>
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: stats?.totalProducts, sub: `${stats?.activeProducts ?? 0} active` },
          { label: "Total Orders", value: stats?.totalOrders, sub: `${stats?.pendingOrders ?? 0} pending` },
          { label: "Total Revenue", value: stats ? `৳${stats.totalRevenue.toFixed(0)}` : null, sub: "from delivered orders" },
          { label: "Shop Rating", value: stats ? (stats.rating > 0 ? stats.rating.toFixed(1) : "—") : null, sub: "avg customer rating" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap mb-8">
        <Link href="/seller/products/new">
          <Button size="sm"><Package className="h-4 w-4 mr-2" />Add Product</Button>
        </Link>
        <Link href="/seller/orders">
          <Button size="sm" variant="outline"><ShoppingBag className="h-4 w-4 mr-2" />View Orders</Button>
        </Link>
        <Link href="/seller/auctions">
          <Button size="sm" variant="outline"><Gavel className="h-4 w-4 mr-2" />Manage Auctions</Button>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Link href="/seller/orders" className="text-sm text-primary hover:underline">View all</Link>
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
                    {["Order ID", "Buyer", "Items", "Total", "Status", "Date"].map((h) => (
                      <th key={h} className="pb-2 text-left text-muted-foreground font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="py-2 font-mono text-xs">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="py-2">{order.buyer?.profile?.fullName || "—"}</td>
                      <td className="py-2 text-muted-foreground">{order.items?.length}</td>
                      <td className="py-2 font-semibold text-primary">৳{Number(order.totalAmount).toFixed(0)}</td>
                      <td className="py-2">
                        <Badge variant={statusVariant[order.status] || "default"} className="text-xs">{order.status}</Badge>
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">{format(new Date(order.createdAt), "dd MMM")}</td>
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