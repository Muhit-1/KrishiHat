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
import Link from "next/link";
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
  pending: "warning", paid: "success", failed: "danger", refunded: "default",
};

const PAYMENT_STATUSES = ["", "pending", "paid", "failed", "refunded"];
const PAYMENT_METHODS = ["", "cod", "bkash", "nagad"];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPayments = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (statusFilter) params.set("status", statusFilter);
    if (methodFilter) params.set("method", methodFilter);

    fetch(`/api/admin/payments?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setPayments(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [statusFilter, methodFilter]);

  const handleUpdate = async (paymentId: string, newStatus: string) => {
    setUpdating(paymentId);
    await fetch(`/api/admin/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(null);
    fetchPayments();
  };

  // Summary stats
  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Payments" subtitle={`${total} payment records`} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Records", value: total },
          { label: "Paid", value: payments.filter((p) => p.status === "paid").length },
          { label: "Pending", value: pendingCount },
          { label: "Revenue (Paid)", value: `৳${totalRevenue.toFixed(0)}` },
        ].map((s) => (
          <div key={s.label} className="bg-muted/40 border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-5">
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground self-center mr-1">Status:</span>
          {PAYMENT_STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
              className="capitalize text-xs h-7"
            >
              {s || "All"}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground self-center mr-1">Method:</span>
          {PAYMENT_METHODS.map((m) => (
            <Button
              key={m}
              size="sm"
              variant={methodFilter === m ? "default" : "outline"}
              onClick={() => setMethodFilter(m)}
              className="uppercase text-xs h-7"
            >
              {m || "All"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState icon={<CreditCard className="h-12 w-12" />} title="No payment records found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Order ID", "Buyer", "Seller", "Amount", "Method", "Status", "Transaction ID", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3">
                    <Link href={`/admin/orders/${payment.orderId}`} className="font-mono text-xs text-primary hover:underline">
                      #{payment.orderId.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-xs">{payment.order?.buyer?.profile?.fullName || "—"}</td>
                  <td className="px-3 py-3 text-xs">{payment.order?.seller?.sellerProfile?.shopName || "—"}</td>
                  <td className="px-3 py-3 font-bold text-primary text-xs">৳{Number(payment.amount).toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <Badge variant="outline" className="text-xs uppercase">{payment.method}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant[payment.status] || "default"} className="text-xs capitalize">
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                    {payment.transactionId || "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(payment.createdAt), "dd MMM yy")}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      {payment.status === "pending" && (
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs"
                          isLoading={updating === payment.id}
                          onClick={() => handleUpdate(payment.id, "paid")}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {payment.status === "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          isLoading={updating === payment.id}
                          onClick={() => handleUpdate(payment.id, "refunded")}
                        >
                          Refund
                        </Button>
                      )}
                    </div>
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