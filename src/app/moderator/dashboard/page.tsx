"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle, Users, MessageSquare, BarChart2,
  CheckCircle, XCircle, Clock,
} from "lucide-react";
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
  // FIX: Track fetch error so we don't silently show zeros
  const [fetchError, setFetchError] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    setFetchError(false);
    fetch("/api/moderator/stats")
      .then((r) => {
        // FIX: Check HTTP status before parsing — a 401/403 returns HTML not JSON
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (json.success) {
          setStats(json.data);
        } else {
          setFetchError(true);
        }
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout sidebarLinks={modLinks} sidebarTitle="Moderator Panel">
      <SectionHeader
        title="Moderator Dashboard"
        subtitle={`Welcome back${profile?.fullName ? `, ${profile.fullName}` : ""}!`}
      />

      {/* FIX: Show error state instead of silent zeros */}
      {fetchError && !loading && (
        <div className="mb-6 bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-md flex items-center justify-between">
          <span>Failed to load stats. Your session may have expired.</span>
          <Button size="sm" variant="outline" onClick={fetchStats}>
            Retry
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Open Reports",
            // FIX: Show "—" while loading instead of 0, to avoid misleading zeros
            value: stats?.openReports,
            icon: <AlertCircle className="h-5 w-5 text-red-600" />,
            href: "/moderator/reports?status=open",
          },
          {
            label: "Under Review",
            value: stats?.underReviewReports,
            icon: <Clock className="h-5 w-5 text-yellow-600" />,
            href: "/moderator/reports?status=under_review",
          },
          {
            label: "Resolved",
            value: stats?.resolvedReports,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            href: "/moderator/reports?status=resolved",
          },
          {
            label: "Suspended Users",
            value: stats?.suspendedUsers,
            icon: <XCircle className="h-5 w-5 text-orange-600" />,
            href: "/moderator/users?status=suspended",
          },
        ].map((stat) => (
          <Link href={stat.href} key={stat.label}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : fetchError ? (
                  <div className="text-2xl font-bold text-muted-foreground">—</div>
                ) : (
                  // FIX: Only use ?? 0 when stats loaded successfully (not when null from error)
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
            Review Open Reports ({loading ? "…" : stats?.openReports ?? 0})
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
          <Link href="/moderator/reports" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : fetchError ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Could not load reports.{" "}
              <button onClick={fetchStats} className="text-primary underline">
                Try again
              </button>
            </p>
          ) : !stats?.recentReports?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No open reports. Great work!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {["Reporter", "Reported", "Reason", "Status", "Date"].map((h) => (
                      <th
                        key={h}
                        className="pb-2 text-left text-muted-foreground font-medium text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentReports.map((report: any) => (
                    <tr key={report.id} className="hover:bg-muted/30">
                      <td className="py-2 text-xs">
                        {report.reporter?.profile?.fullName || "—"}
                      </td>
                      <td className="py-2 text-xs font-medium">
                        {report.reported?.profile?.fullName || "—"}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                        {report.reason}
                      </td>
                      <td className="py-2">
                        <Badge
                          variant={statusVariant[report.status] || "default"}
                          className="text-xs capitalize"
                        >
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