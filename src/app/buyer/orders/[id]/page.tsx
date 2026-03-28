"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCart, MessageSquare, MapPin, Flag, Package, Truck } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/reports", label: "Reports", icon: <Flag className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  pending: "warning", confirmed: "info", processing: "info",
  shipped: "default", delivered: "success", cancelled: "danger", refunded: "danger",
};

const shipmentStatusLabel: Record<string, string> = {
  not_shipped: "Not Shipped",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  returned: "Returned",
};

export default function BuyerOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrder(json.data);
        else router.push("/buyer/orders");
      })
      .catch(() => router.push("/buyer/orders"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        <SectionHeader
          title={order ? `Order #${order.id.slice(-8).toUpperCase()}` : "Order Detail"}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !order ? null : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left — items + shipment */}
          <div className="md:col-span-2 space-y-4">

            {/* Order Items */}
            <Card>
              <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="h-14 w-14 bg-muted rounded overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                      )}
                      {!item.product?.images?.[0] && <Package className="h-6 w-6 m-auto mt-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × ৳{Number(item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-sm">৳{Number(item.totalPrice).toFixed(2)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipment Tracking */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Delivery Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                {order.shipment ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="info">{shipmentStatusLabel[order.shipment.status] || order.shipment.status}</Badge>
                    </div>
                    {order.shipment.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tracking #</span>
                        <span className="font-mono font-medium">{order.shipment.trackingNumber}</span>
                      </div>
                    )}
                    {order.shipment.carrier && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carrier</span>
                        <span>{order.shipment.carrier}</span>
                      </div>
                    )}
                    {order.shipment.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered At</span>
                        <span>{format(new Date(order.shipment.deliveredAt), "dd MMM yyyy")}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No shipment information yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right — summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(new Date(order.createdAt), "dd MMM yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant[order.status] || "default"}>{order.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <Badge variant={order.payment?.status === "paid" ? "success" : "warning"}>
                    {order.payment?.status || "pending"} ({order.payment?.method?.toUpperCase() || "COD"})
                  </Badge>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">৳{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Seller</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.seller?.sellerProfile?.shopName || "—"}</p>
                <p className="text-muted-foreground">{order.seller?.profile?.fullName}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Delivery Address</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                {order.note && (
                  <p className="text-xs text-muted-foreground mt-2 italic">Note: {order.note}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}