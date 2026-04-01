"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Flag, ShoppingBag, ShoppingCart, MessageSquare, MapPin, AlertCircle } from "lucide-react";
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

type Report = {
  id: string;
  reason: string;
  description?: string;
  status: "open" | "under_review" | "resolved" | "dismissed";
  createdAt: string;
  reported: {
    profile?: { fullName?: string };
    sellerProfile?: { shopName?: string };
  };
};

const statusVariant: Record<string, "warning" | "info" | "success" | "default"> = {
  open: "warning",
  under_review: "info",
  resolved: "success",
  dismissed: "default",
};

const statusLabel: Record<string, string> = {
  open: "Open",
  under_review: "Under Review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export default function BuyerReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/reports");
        const json = await res.json();

        if (json.success) {
          // Handle paginated response: { data: { items: [...], ... } } or { data: [...] }
          const items = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.data?.items)
            ? json.data.items
            : [];
          setReports(items);
        } else {
          setError(json.message || "Failed to load reports.");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader
        title="My Reports"
        subtitle="Track the status of reports you've submitted"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<Flag className="h-12 w-12" />}
          title="No reports filed"
          description="When you report a seller from a product page, your reports will appear here."
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const reportedName =
              report.reported?.sellerProfile?.shopName ||
              report.reported?.profile?.fullName ||
              "Unknown";

            return (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Flag className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold truncate">
                            Reported: {reportedName}
                          </p>
                          <Badge variant={statusVariant[report.status] ?? "default"}>
                            {statusLabel[report.status] ?? report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-1">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        {report.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {report.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted on{" "}
                          {format(new Date(report.createdAt), "dd MMM yyyy, hh:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}