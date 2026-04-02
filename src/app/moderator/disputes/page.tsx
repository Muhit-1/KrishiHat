"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { AlertCircle, Users, MessageSquare, BarChart2 } from "lucide-react";
import { format } from "date-fns";

const modLinks = [
  { href: "/moderator/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/moderator/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/moderator/disputes", label: "Disputes", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/moderator/users", label: "Users", icon: <Users className="h-4 w-4" /> },
];

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  // FIX: Track errors so moderator knows if resolve failed
  const [resolveError, setResolveError] = useState<string | null>(null);

  const fetchDisputes = () => {
    setLoading(true);
    fetch("/api/reports?limit=50&status=open")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const all = json.data.items;
          const disputeKeywords = [
            "order", "delivery", "product", "payment",
            "refund", "dispute", "not received", "wrong item",
          ];
          const filtered = all.filter((r: any) =>
            disputeKeywords.some(
              (kw) =>
                r.reason?.toLowerCase().includes(kw) ||
                r.description?.toLowerCase().includes(kw)
            )
          );
          setDisputes(filtered.length > 0 ? filtered : all.slice(0, 5));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (id: string, status: "resolved" | "dismissed") => {
    setResolving(id);
    setResolveError(null);

    try {
      const res = await fetch(`/api/reports/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      // FIX: Only remove from local state if the API call actually succeeded.
      // Previously the item was removed regardless of API response, causing
      // it to reappear on the next full fetch.
      if (json.success) {
        setDisputes((prev) => prev.filter((d) => d.id !== id));
      } else {
        setResolveError(json.message || "Failed to resolve dispute. Please try again.");
      }
    } catch {
      setResolveError("Network error. Please try again.");
    } finally {
      setResolving(null);
    }
  };

  return (
    <DashboardLayout sidebarLinks={modLinks} sidebarTitle="Moderator Panel">
      <SectionHeader
        title="Disputes"
        subtitle="Order and delivery related disputes between buyers and sellers"
      />

      {resolveError && (
        <div className="mb-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-2 rounded-md">
          {resolveError}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : disputes.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="No active disputes"
          description="All order and delivery disputes have been resolved."
        />
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute: any) => (
            <div key={dispute.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="danger" className="text-xs">Open Dispute</Badge>
                    <span className="text-xs text-muted-foreground">
                      Filed {format(new Date(dispute.createdAt), "dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Filed By</p>
                      <p className="font-medium">{dispute.reporter?.profile?.fullName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Against</p>
                      <p className="font-medium">{dispute.reported?.profile?.fullName || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reason</p>
                    <p className="text-sm font-medium">{dispute.reason}</p>
                  </div>
                  {dispute.description && (
                    <p className="text-xs text-muted-foreground bg-muted px-2 py-1.5 rounded">
                      {dispute.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    isLoading={resolving === dispute.id}
                    onClick={() => handleResolve(dispute.id, "resolved")}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={resolving === dispute.id}
                    onClick={() => handleResolve(dispute.id, "dismissed")}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}