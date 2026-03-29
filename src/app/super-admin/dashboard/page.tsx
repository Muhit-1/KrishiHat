"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, Users, Settings, ClipboardList,
  UserCheck, ShoppingBag, Package, TrendingUp,
  AlertTriangle, Ban,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const superAdminLinks = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: <Shield className="h-4 w-4" /> },
  { href: "/super-admin/admins", label: "Admins & Moderators", icon: <Users className="h-4 w-4" /> },
  { href: "/super-admin/system-logs", label: "System Logs", icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/super-admin/settings", label: "Platform Settings", icon: <Settings className="h-4 w-4" /> },
];

const roleColor: Record<string, string> = {
  admin: "bg-blue-100 text-blue-800",
  moderator: "bg-purple-100 text-purple-800",
};

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/stats")
      .then((r) => r.json())
      .then((json) => { if (json.success) setStats(json.data); })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers, sub: `${stats.totalBuyers} buyers`, icon: <Users className="h-5 w-5 text-blue-600" /> },
    { label: "Admins", value: stats.totalAdmins, sub: `${stats.totalModerators} moderators`, icon: <Shield className="h-5 w-5 text-primary" /> },
    { label: "Total Orders", value: stats.totalOrders, sub: "platform-wide", icon: <ShoppingBag className="h-5 w-5 text-yellow-600" /> },
    { label: "Total Revenue", value: `৳${stats.totalRevenue.toFixed(0)}`, sub: "from paid orders", icon: <TrendingUp className="h-5 w-5 text-green-600" /> },
    { label: "Products Listed", value: stats.totalProducts, sub: "total listings", icon: <Package className="h-5 w-5 text-purple-600" /> },
    { label: "Suspended Users", value: stats.suspendedUsers, sub: `${stats.bannedUsers} banned`, icon: <AlertTriangle className="h-5 w-5 text-orange-600" /> },
    { label: "Audit Log Entries", value: stats.totalAuditLogs, sub: "all-time", icon: <ClipboardList className="h-5 w-5 text-muted-foreground" /> },
  ] : [];

  return (
    <DashboardLayout sidebarLinks={superAdminLinks} sidebarTitle="Super Admin">
      <SectionHeader title="Super Admin Dashboard" subtitle="Full platform control and oversight" />

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

      {/* Recent Admin/Moderator Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Admin & Moderator Accounts</CardTitle>
          <Link href="/super-admin/admins" className="text-sm text-primary hover:underline">
            Manage all
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !stats?.recentAdmins?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No admin accounts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {["Name", "Email", "Role", "Status", "Created"].map((h) => (
                      <th key={h} className="pb-2 text-left text-muted-foreground font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentAdmins.map((admin: any) => (
                    <tr key={admin.id} className="hover:bg-muted/30">
                      <td className="py-2 font-medium text-sm">{admin.profile?.fullName || "—"}</td>
                      <td className="py-2 text-xs text-muted-foreground">{admin.email}</td>
                      <td className="py-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColor[admin.role] || "bg-gray-100 text-gray-800"}`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-2">
                        <Badge variant={admin.status === "active" ? "success" : "warning"} className="text-xs">
                          {admin.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {format(new Date(admin.createdAt), "dd MMM yyyy")}
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