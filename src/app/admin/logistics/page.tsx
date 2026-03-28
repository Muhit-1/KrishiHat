"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
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

const shipmentVariant: Record<string, any> = {
  not_shipped: "warning",
  picked_up: "info",
  in_transit: "info",
  out_for_delivery: "default",
  delivered: "success",
  returned: "danger",
};

const SHIPMENT_STATUSES = [
  "", "not_shipped", "picked_up", "in_transit",
  "out_for_delivery", "delivered", "returned",
];

interface UpdateForm {
  shipmentId: string;
  status: string;
  trackingNumber: string;
  carrier: string;
  estimatedDate: string;
}

export default function AdminLogisticsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [editModal, setEditModal] = useState<UpdateForm | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchShipments = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/shipments?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setShipments(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchShipments(); }, [statusFilter]);

  const openEdit = (shipment: any) => {
    setEditModal({
      shipmentId: shipment.id,
      status: shipment.status,
      trackingNumber: shipment.trackingNumber || "",
      carrier: shipment.carrier || "",
      estimatedDate: shipment.estimatedDate
        ? new Date(shipment.estimatedDate).toISOString().slice(0, 10)
        : "",
    });
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    setUpdating(true);

    await fetch(`/api/admin/shipments/${editModal.shipmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: editModal.status,
        trackingNumber: editModal.trackingNumber || undefined,
        carrier: editModal.carrier || undefined,
        estimatedDate: editModal.estimatedDate
          ? new Date(editModal.estimatedDate).toISOString()
          : undefined,
      }),
    });

    setUpdating(false);
    setEditModal(null);
    fetchShipments();
  };

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Logistics" subtitle={`${total} shipment records`} />

      {/* Summary strip */}
      <div className="flex gap-3 flex-wrap mb-5">
        {SHIPMENT_STATUSES.filter(Boolean).map((s) => {
          const count = shipments.filter((sh) => sh.status === s).length;
          return (
            <div key={s} className="flex items-center gap-1.5 bg-muted/40 border rounded-md px-3 py-1.5">
              <Badge variant={shipmentVariant[s] || "default"} className="text-xs capitalize">
                {s.replace(/_/g, " ")}
              </Badge>
              <span className="text-xs font-bold">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {SHIPMENT_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            className="capitalize text-xs h-7"
          >
            {s ? s.replace(/_/g, " ") : "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : shipments.length === 0 ? (
        <EmptyState icon={<Truck className="h-12 w-12" />} title="No shipments found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Order ID", "Buyer", "Seller", "Status", "Tracking #", "Carrier", "Est. Delivery", "Updated", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {shipments.map((shipment: any) => (
                <tr key={shipment.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3">
                    <Link href={`/admin/orders/${shipment.orderId}`} className="font-mono text-xs text-primary hover:underline">
                      #{shipment.orderId.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-xs">{shipment.order?.buyer?.profile?.fullName || "—"}</td>
                  <td className="px-3 py-3 text-xs">{shipment.order?.seller?.sellerProfile?.shopName || "—"}</td>
                  <td className="px-3 py-3">
                    <Badge variant={shipmentVariant[shipment.status] || "default"} className="text-xs capitalize">
                      {shipment.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                    {shipment.trackingNumber || "—"}
                  </td>
                  <td className="px-3 py-3 text-xs">{shipment.carrier || "—"}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {shipment.estimatedDate
                      ? format(new Date(shipment.estimatedDate), "dd MMM yyyy")
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(shipment.updatedAt), "dd MMM yy")}
                  </td>
                  <td className="px-3 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => openEdit(shipment)}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Modal */}
      {editModal && (
        <Modal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          title="Update Shipment"
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Shipment Status *</label>
              <select
                value={editModal.status}
                onChange={(e) => setEditModal((prev) => prev ? { ...prev, status: e.target.value } : prev)}
                className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SHIPMENT_STATUSES.filter(Boolean).map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Tracking Number"
              value={editModal.trackingNumber}
              onChange={(e) => setEditModal((prev) => prev ? { ...prev, trackingNumber: e.target.value } : prev)}
              placeholder="e.g. SA123456BD"
            />

            <Input
              label="Carrier / Courier"
              value={editModal.carrier}
              onChange={(e) => setEditModal((prev) => prev ? { ...prev, carrier: e.target.value } : prev)}
              placeholder="e.g. Pathao, Sundarban Courier"
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Estimated Delivery Date</label>
              <input
                type="date"
                value={editModal.estimatedDate}
                onChange={(e) => setEditModal((prev) => prev ? { ...prev, estimatedDate: e.target.value } : prev)}
                className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleUpdate}
                isLoading={updating}
                className="flex-1"
              >
                Update Shipment
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditModal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}