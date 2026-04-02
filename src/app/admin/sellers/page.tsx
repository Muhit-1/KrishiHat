"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  Tag,
  TrendingUp,
  Truck,
  AlertCircle,
  ClipboardList,
  X,
} from "lucide-react";

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

type Seller = {
  id: string;
  email: string;
  profile?: {
    fullName?: string | null;
  } | null;
  sellerProfile?: {
    shopName?: string | null;
    isVerified?: boolean;
  } | null;
};

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<"approve" | "revoke" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users?role=seller&limit=50", {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success) {
        setSellers(json.data.items || []);
      } else {
        setErrorMessage(json.message || "Failed to load sellers.");
      }
    } catch (error) {
      setErrorMessage("Failed to load sellers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const updateSellerVerificationState = (userId: string, verified: boolean) => {
    setSellers((prev) =>
      prev.map((seller) =>
        seller.id === userId
          ? {
            ...seller,
            sellerProfile: {
              ...seller.sellerProfile,
              isVerified: verified,
            },
          }
          : seller
      )
    );
  };

  const handleApprove = async (userId: string) => {
    const previousSellers = sellers;

    try {
      setProcessingId(userId);
      setProcessingAction("approve");
      setErrorMessage("");

      // Optimistic UI update
      updateSellerVerificationState(userId, true);

      const res = await fetch(`/api/admin/sellers/verify/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", reason: "" }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setSellers(previousSellers);
        setErrorMessage(json?.message || "Failed to approve seller.");
        return;
      }

      // Optional background sync to keep data accurate
      fetchSellers();
    } catch (error) {
      setSellers(previousSellers);
      setErrorMessage("Failed to approve seller.");
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const openRevokeModal = (seller: Seller) => {
    setSelectedSeller(seller);
    setRevokeReason("");
    setRevokeModalOpen(true);
  };

  const closeRevokeModal = () => {
    if (processingId) return;
    setRevokeModalOpen(false);
    setSelectedSeller(null);
    setRevokeReason("");
  };

  const confirmRevoke = async () => {
    if (!selectedSeller) return;

    const userId = selectedSeller.id;
    const previousSellers = sellers;

    try {
      setProcessingId(userId);
      setErrorMessage("");

      // Optimistic UI update
      updateSellerVerificationState(userId, false);

      const res = await fetch(`/api/admin/sellers/verify/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason: revokeReason.trim(),
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setSellers(previousSellers);
        setErrorMessage(json?.message || "Failed to revoke seller.");
        return;
      }

      setRevokeModalOpen(false);
      setSelectedSeller(null);
      setRevokeReason("");

      // Optional background sync
      fetchSellers();
    } catch (error) {
      setSellers(previousSellers);
      setErrorMessage("Failed to revoke seller.");
    } finally {
      setProcessingId(null);
    }
  };

  const tableContent = useMemo(() => {
    if (sellers.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
            No sellers found
          </td>
        </tr>
      );
    }

    return sellers.map((s) => {
      const isVerified = !!s.sellerProfile?.isVerified;
      const isProcessing = processingId === s.id;

      return (
        <tr key={s.id} className="hover:bg-muted/30">
          <td className="px-4 py-3 font-medium">{s.sellerProfile?.shopName || "—"}</td>
          <td className="px-4 py-3">{s.profile?.fullName || "—"}</td>
          <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
          <td className="px-4 py-3">
            <Badge variant={isVerified ? "success" : "warning"}>
              {isVerified ? "Verified" : "Unverified"}
            </Badge>
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              
                <Button
                  size="sm"
                  variant={!isVerified ? "default" : "outline"}
                  disabled={isProcessing}
                  onClick={() => {
                    if (!isVerified) {
                      handleApprove(s.id);
                    } else {
                      openRevokeModal(s);
                    }
                  }}
                >
                  {isProcessing
                    ? processingAction === "approve"
                      ? "Approving..."
                      : "Revoking..."
                    : !isVerified
                      ? "Approve"
                      : "Revoke"}
                </Button>
              
            </div>
          </td>
        </tr>
      );
    });
  }, [sellers, processingId]);

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Sellers" subtitle="Manage seller accounts and verification" />

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Shop Name", "Owner", "Email", "Verified", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">{tableContent}</tbody>
          </table>
        </div>
      )}

      {revokeModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Revoke Seller Access</h2>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to revoke this seller account?
                </p>
              </div>
              <button
                type="button"
                onClick={closeRevokeModal}
                className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                disabled={!!processingId}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p>
                  <span className="font-medium">Shop:</span>{" "}
                  {selectedSeller.sellerProfile?.shopName || "—"}
                </p>
                <p>
                  <span className="font-medium">Owner:</span>{" "}
                  {selectedSeller.profile?.fullName || "—"}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {selectedSeller.email}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="revokeReason" className="text-sm font-medium">
                  Reason for revocation
                  <span className="ml-1 text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id="revokeReason"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Enter a reason to show in records or notifications..."
                  rows={4}
                  disabled={processingId === selectedSeller.id}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeRevokeModal}
                disabled={processingId === selectedSeller.id}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmRevoke}
                disabled={processingId === selectedSeller.id}
              >
                {processingId === selectedSeller.id ? "Revoking..." : "Confirm Revoke"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}