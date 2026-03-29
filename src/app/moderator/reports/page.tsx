"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Modal } from "@/components/ui/modal";
import { AlertCircle, Users, MessageSquare, BarChart2 } from "lucide-react";
import { format } from "date-fns";

const modLinks = [
  { href: "/moderator/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/moderator/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/moderator/disputes", label: "Disputes", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/moderator/users", label: "Users", icon: <Users className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  open: "danger", under_review: "warning", resolved: "success", dismissed: "default",
};

const STATUSES = ["", "open", "under_review", "resolved", "dismissed"];

export default function ModeratorReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [resolving, setResolving] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<any | null>(null);

  const fetchReports = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/reports?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setReports(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const handleResolve = async (id: string, status: "resolved" | "dismissed") => {
    setResolving(id);
    await fetch(`/api/reports/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setResolving(null);
    setDetailModal(null);
    fetchReports();
  };

  const handleMarkUnderReview = async (id: string) => {
    // Use the reports resolve endpoint with a custom extension
    // We'll use a PATCH to the reports directly
    await fetch(`/api/reports/${id}/review`, { method: "POST" });
    fetchReports();
  };

  return (
    <DashboardLayout sidebarLinks={modLinks} sidebarTitle="Moderator Panel">
      <SectionHeader title="User Reports" subtitle={`${total} reports`} />

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            className="capitalize text-xs"
          >
            {s ? s.replace(/_/g, " ") : "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="h-12 w-12" />}
          title="No reports found"
          description={statusFilter === "open" ? "No open reports to review." : "No reports match this filter."}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Reporter", "Reported User", "Reason", "Description", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((report: any) => (
                <tr key={report.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3 text-xs">{report.reporter?.profile?.fullName || "—"}</td>
                  <td className="px-3 py-3 text-xs font-medium">{report.reported?.profile?.fullName || "—"}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground max-w-[140px] truncate">{report.reason}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground max-w-[140px] truncate">
                    {report.description || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant[report.status] || "default"} className="text-xs capitalize">
                      {report.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(report.createdAt), "dd MMM yy")}
                  </td>
                  <td className="px-3 py-3">
                    {(report.status === "open" || report.status === "under_review") ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setDetailModal(report)}
                        >
                          Review
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground capitalize">
                        {report.status.replace(/_/g, " ")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <Modal
          isOpen={!!detailModal}
          onClose={() => setDetailModal(null)}
          title="Review Report"
          className="max-w-lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Reporter</p>
                <p className="font-medium">{detailModal.reporter?.profile?.fullName || "—"}</p>
                <p className="text-xs text-muted-foreground">{detailModal.reporter?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reported User</p>
                <p className="font-medium">{detailModal.reported?.profile?.fullName || "—"}</p>
                <p className="text-xs text-muted-foreground">{detailModal.reported?.email}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Reason</p>
              <p className="text-sm font-medium bg-muted px-3 py-2 rounded-md">{detailModal.reason}</p>
            </div>

            {detailModal.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Full Description</p>
                <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                  {detailModal.description}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground">Filed On</p>
              <p className="text-sm">{format(new Date(detailModal.createdAt), "dd MMM yyyy, hh:mm a")}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-xs">
              Resolving this report will notify the system. Dismissing will close the report without action.
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                isLoading={resolving === detailModal.id}
                onClick={() => handleResolve(detailModal.id, "resolved")}
              >
                Mark Resolved
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                isLoading={resolving === detailModal.id}
                onClick={() => handleResolve(detailModal.id, "dismissed")}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}