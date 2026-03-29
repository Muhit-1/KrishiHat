"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users, MessageSquare, BarChart2, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

const modLinks = [
  { href: "/moderator/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/moderator/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/moderator/disputes", label: "Disputes", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/moderator/users", label: "Users", icon: <Users className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  open: "danger", under_review: "warning", resolved: "success", dismissed: "default",
};

export default function ModeratorDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/moderator/stats")
      .then((r) => r.json())
      .then((json) => { if (json.success) setStats(json.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout sidebarLinks={modLinks} sidebarTitle="Moderator Panel">
      <SectionHeader
        title="Moderator Dashboard"
        subtitle={`Welcome back${profile?.fullName ? `, ${profile.fullName}` : ""}!`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Open Reports", value: stats?.openReports, icon: <AlertCircle className="h-5 w-5 text-red-600" />, href: "/moderator/reports" },
          { label: "Under Review", value: stats?.underReviewReports, icon: <Clock className="h-5 w-5 text-yellow-600" />, href: "/moderator/reports" },
          { label: "Resolved", value: stats?.resolvedReports, icon: <CheckCircle className="h-5 w-5 text-green-600" />, href: "/moderator/reports" },
          { label: "Suspended Users", value: stats?.suspendedUsers, icon: <XCircle className="h-5 w-5 text-orange-600" />, href: "/moderator/users" },
        ].map((stat) => (
          <Link href={stat.href} key={stat.label}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value ?? 0}</div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap mb-8">
        <Link href="/moderator/reports">
          <Button size="sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Review Open Reports ({stats?.openReports ?? 0})
          </Button>
        </Link>
        <Link href="/moderator/users">
          <Button size="sm" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
        </Link>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Open Reports</CardTitle>
          <Link href="/moderator/reports" className="text-sm text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !stats?.recentReports?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No open reports. Great work!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {["Reporter", "Reported", "Reason", "Status", "Date"].map((h) => (
                      <th key={h} className="pb-2 text-left text-muted-foreground font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentReports.map((report: any) => (
                    <tr key={report.id} className="hover:bg-muted/30">
                      <td className="py-2 text-xs">{report.reporter?.profile?.fullName || "—"}</td>
                      <td className="py-2 text-xs font-medium">{report.reported?.profile?.fullName || "—"}</td>
                      <td className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">{report.reason}</td>
                      <td className="py-2">
                        <Badge variant={statusVariant[report.status] || "default"} className="text-xs capitalize">
                          {report.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {format(new Date(report.createdAt), "dd MMM")}
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