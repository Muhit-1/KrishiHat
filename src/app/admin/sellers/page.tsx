"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Package, ShoppingBag, CreditCard, Tag, TrendingUp, Truck, AlertCircle, ClipboardList } from "lucide-react";

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

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = () => {
    fetch("/api/admin/users?role=seller&limit=50")
      .then((r) => r.json())
      .then((json) => { if (json.success) setSellers(json.data.items); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSellers(); }, []);

  const handleVerify = async (userId: string, action: "approve" | "reject") => {
    const reason = action === "reject" ? prompt("Reason for rejection (optional):") || "" : "";
    await fetch(`/api/admin/sellers/verify/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    fetchSellers();
  };

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Sellers" subtitle="Manage seller accounts and verification" />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Shop Name", "Owner", "Email", "Verified", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sellers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No sellers found</td></tr>
              ) : sellers.map((s: any) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.sellerProfile?.shopName || "—"}</td>
                  <td className="px-4 py-3">{s.profile?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.sellerProfile?.isVerified ? "success" : "warning"}>
                      {s.sellerProfile?.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {!s.sellerProfile?.isVerified && (
                      <Button size="sm" variant="default" onClick={() => handleVerify(s.id, "approve")}>
                        Approve
                      </Button>
                    )}
                    {s.sellerProfile?.isVerified && (
                      <Button size="sm" variant="outline" onClick={() => handleVerify(s.id, "reject")}>
                        Revoke
                      </Button>
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