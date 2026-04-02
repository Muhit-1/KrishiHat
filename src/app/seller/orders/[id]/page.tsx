"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingBag, Gavel, MessageSquare, BarChart2, User, BadgeCheck, FileText } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const sellerLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/seller/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/seller/auctions", label: "Auctions", icon: <Gavel className="h-4 w-4" /> },
  { href: "/seller/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/seller/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/seller/verification", label: "Verification", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/seller/profile", label: "Shop Profile", icon: <User className="h-4 w-4" /> },
  { href: "/seller/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  pending: "warning", confirmed: "info", processing: "info",
  shipped: "default", delivered: "success", cancelled: "danger",
};

const NEXT_STATUS: Record<string, { label: string; value: string }[]> = {
  pending: [{ label: "Confirm Order", value: "confirmed" }, { label: "Cancel", value: "cancelled" }],
  confirmed: [{ label: "Mark Processing", value: "processing" }, { label: "Cancel", value: "cancelled" }],
  processing: [{ label: "Mark Shipped", value: "shipped" }, { label: "Cancel", value: "cancelled" }],
  shipped: [{ label: "Mark Delivered", value: "delivered" }],
  delivered: [],
  cancelled: [],
  refunded: [],
};

export default function SellerOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const router = useRouter();

  const fetchOrder = () => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setOrder(json.data);
          setTrackingNumber(json.data.shipment?.trackingNumber || "");
          setCarrier(json.data.shipment?.carrier || "");
        } else {
          router.push("/seller/orders");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [params.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    const res = await fetch(`/api/orders/${params.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        ...(newStatus === "shipped" && { trackingNumber, carrier }),
      }),
    });
    const json = await res.json();
    if (json.success) fetchOrder();
    setUpdating(false);
  };

  const nextActions = order ? (NEXT_STATUS[order.status] || []) : [];

  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        <SectionHeader title={order ? `Order #${order.id.slice(-8).toUpperCase()}` : "Order Detail"} />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !order ? null : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">

            {/* Items */}
            <Card>
              <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="h-14 w-14 bg-muted rounded overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                      ) : <Package className="h-6 w-6 m-auto mt-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product?.title}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} × ৳{Number(item.unitPrice).toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-sm">৳{Number(item.totalPrice).toFixed(2)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Status Update */}
            {nextActions.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Update Order Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Shipping fields — only show when moving to shipped */}
                  {order.status === "processing" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Tracking Number (optional)"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. SA123456BD"
                      />
                      <Input
                        label="Carrier (optional)"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        placeholder="e.g. Pathao, Sundarban"
                      />
                    </div>
                  )}
                  <div className="flex gap-3 flex-wrap">
                    {nextActions.map((action) => (
                      <Button
                        key={action.value}
                        variant={action.value === "cancelled" ? "destructive" : "default"}
                        isLoading={updating}
                        onClick={() => handleStatusUpdate(action.value)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery address */}
            <Card>
              <CardHeader><CardTitle className="text-base">Delivery Address</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                {order.note && <p className="text-xs text-muted-foreground mt-2 italic">Note: {order.note}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant[order.status] || "default"}>{order.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <Badge variant={order.payment?.status === "paid" ? "success" : "warning"}>
                    {order.payment?.method?.toUpperCase()} — {order.payment?.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(new Date(order.createdAt), "dd MMM yyyy")}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">৳{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Buyer Info</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.buyer?.profile?.fullName || "—"}</p>
                <p className="text-muted-foreground">{order.buyer?.profile?.phone || "No phone"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}