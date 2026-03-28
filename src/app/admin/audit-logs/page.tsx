"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import {
  Users, Package, ShoppingBag, CreditCard, Tag,
  TrendingUp, Truck, AlertCircle, ClipboardList, ChevronLeft, ChevronRight,
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

const ACTION_COLOR: Record<string, string> = {
  LOGIN: "text-green-700 bg-green-50",
  SIGNUP: "text-blue-700 bg-blue-50",
  LOGOUT: "text-gray-700 bg-gray-100",
  ORDER_PLACED: "text-purple-700 bg-purple-50",
  ORDER_STATUS_CHANGED: "text-yellow-700 bg-yellow-50",
  PRODUCT_CREATED: "text-blue-700 bg-blue-50",
  PRODUCT_UPDATED: "text-blue-700 bg-blue-50",
  PRODUCT_DELETED: "text-red-700 bg-red-50",
  USER_SUSPEND: "text-red-700 bg-red-50",
  USER_UNSUSPEND: "text-green-700 bg-green-50",
  USER_BAN: "text-red-700 bg-red-50",
  SELLER_VERIFICATION_APPROVE: "text-green-700 bg-green-50",
  SELLER_VERIFICATION_REJECT: "text-red-700 bg-red-50",
  PAYMENT_STATUS_UPDATED: "text-purple-700 bg-purple-50",
  SHIPMENT_UPDATED: "text-blue-700 bg-blue-50",
  EMAIL_VERIFIED: "text-green-700 bg-green-50",
  PASSWORD_RESET: "text-yellow-700 bg-yellow-50",
  MARKET_PRICE_UPDATED: "text-orange-700 bg-orange-50",
  MARKET_PRICE_DELETED: "text-red-700 bg-red-50",
  AUCTION_CREATED: "text-purple-700 bg-purple-50",
  AUCTION_ENDED: "text-gray-700 bg-gray-100",
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("");
  const LIMIT = 30;

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
    if (entityFilter) params.set("entity", entityFilter);

    fetch(`/api/admin/audit-logs?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setLogs(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page, entityFilter]);

  const totalPages = Math.ceil(total / LIMIT);

  const ENTITIES = ["", "User", "Product", "Order", "Payment", "Shipment", "Auction", "MarketPrice", "Report", "SellerProfile"];

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Audit Logs" subtitle={`${total} total log entries`} />

      {/* Entity filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {ENTITIES.map((e) => (
          <Button
            key={e}
            size="sm"
            variant={entityFilter === e ? "default" : "outline"}
            onClick={() => { setEntityFilter(e); setPage(1); }}
            className="text-xs h-7"
          >
            {e || "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : logs.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-12 w-12" />} title="No logs found" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {["User", "Action", "Entity", "Entity ID", "IP", "Timestamp"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs">{log.user?.profile?.fullName || log.userId?.slice(0, 8) || "System"}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${ACTION_COLOR[log.action] || "text-gray-700 bg-gray-100"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{log.entity}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {log.entityId ? log.entityId.slice(-8).toUpperCase() : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{log.ipAddress || "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.createdAt), "dd MMM yy, HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} ({total} entries)
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}