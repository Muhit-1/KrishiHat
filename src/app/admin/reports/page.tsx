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
  TrendingUp, Truck, AlertCircle, ClipboardList,
} from "lucide-react";
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
  open: "danger", under_review: "warning", resolved: "success", dismissed: "default",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchReports = () => {
    setLoading(true);
    fetch("/api/reports?limit=50")
      .then((r) => r.json())
      .then((json) => { if (json.success) setReports(json.data.items); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleResolve = async (id: string, status: "resolved" | "dismissed") => {
    setResolving(id);
    await fetch(`/api/reports/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setResolving(null);
    fetchReports();
  };

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="User Reports" subtitle="Review and resolve reported users" />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : reports.length === 0 ? (
        <EmptyState icon={<AlertCircle className="h-12 w-12" />} title="No reports found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Reporter", "Reported User", "Reason", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((report: any) => (
                <tr key={report.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs">{report.reporter?.profile?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-xs font-medium">{report.reported?.profile?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{report.reason}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[report.status] || "default"} className="text-xs capitalize">
                      {report.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(report.createdAt), "dd MMM yy")}
                  </td>
                  <td className="px-4 py-3">
                    {report.status === "open" || report.status === "under_review" ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs"
                          isLoading={resolving === report.id}
                          onClick={() => handleResolve(report.id, "resolved")}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          isLoading={resolving === report.id}
                          onClick={() => handleResolve(report.id, "dismissed")}
                        >
                          Dismiss
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground capitalize">{report.status}</span>
                    )}
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