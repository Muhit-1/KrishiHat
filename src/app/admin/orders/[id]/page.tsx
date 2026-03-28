"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Package, ShoppingBag, CreditCard, Tag,
  TrendingUp, Truck, AlertCircle, ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

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
  pending: "warning", confirmed: "info", processing: "info",
  shipped: "default", delivered: "success", cancelled: "danger",
};

const paymentVariant: Record<string, any> = {
  pending: "warning", paid: "success", failed: "danger", refunded: "default",
};

const shipmentVariant: Record<string, any> = {
  not_shipped: "warning", picked_up: "info", in_transit: "info",
  out_for_delivery: "default", delivered: "success", returned: "danger",
};

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [updatingShipment, setUpdatingShipment] = useState(false);
  const router = useRouter();

  const fetchOrder = () => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrder(json.data);
        else router.push("/admin/orders");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [params.id]);

  const handlePaymentUpdate = async (status: string) => {
    setUpdatingPayment(true);
    await fetch(`/api/admin/payments/${order.payment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrder();
    setUpdatingPayment(false);
  };

  const handleShipmentUpdate = async (status: string) => {
    setUpdatingShipment(true);
    await fetch(`/api/admin/shipments/${order.shipment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrder();
    setUpdatingShipment(false);
  };

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        <SectionHeader title={order ? `Order #${order.id.slice(-8).toUpperCase()}` : "Order Detail"} />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !order ? null : (
        <div className="grid md:grid-cols-3 gap-6">

          {/* Left */}
          <div className="md:col-span-2 space-y-5">

            {/* Order Items */}
            <Card>
              <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="h-12 w-12 bg-muted rounded overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                      ) : <Package className="h-5 w-5 m-auto mt-3 text-muted-foreground" />}
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
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">৳{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Management */}
            {order.payment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Method</p>
                      <p className="font-semibold uppercase">{order.payment.method}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={paymentVariant[order.payment.status] || "default"}>
                        {order.payment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-bold text-primary">৳{Number(order.payment.amount).toFixed(2)}</p>
                    </div>
                    {order.payment.transactionId && (
                      <div>
                        <p className="text-muted-foreground">Transaction ID</p>
                        <p className="font-mono text-sm">{order.payment.transactionId}</p>
                      </div>
                    )}
                    {order.payment.paidAt && (
                      <div>
                        <p className="text-muted-foreground">Paid At</p>
                        <p className="text-sm">{format(new Date(order.payment.paidAt), "dd MMM yyyy, hh:mm a")}</p>
                      </div>
                    )}
                  </div>

                  {/* Admin payment actions */}
                  <div className="flex gap-2 flex-wrap">
                    {order.payment.status !== "paid" && (
                      <Button
                        size="sm"
                        variant="default"
                        isLoading={updatingPayment}
                        onClick={() => handlePaymentUpdate("paid")}
                      >
                        Mark as Paid
                      </Button>
                    )}
                    {order.payment.status === "paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={updatingPayment}
                        onClick={() => handlePaymentUpdate("refunded")}
                      >
                        Mark as Refunded
                      </Button>
                    )}
                    {order.payment.status !== "failed" && order.payment.status !== "paid" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        isLoading={updatingPayment}
                        onClick={() => handlePaymentUpdate("failed")}
                      >
                        Mark as Failed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipment Management */}
            {order.shipment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Shipment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={shipmentVariant[order.shipment.status] || "default"} className="capitalize">
                        {order.shipment.status?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {order.shipment.trackingNumber && (
                      <div>
                        <p className="text-muted-foreground">Tracking #</p>
                        <p className="font-mono">{order.shipment.trackingNumber}</p>
                      </div>
                    )}
                    {order.shipment.carrier && (
                      <div>
                        <p className="text-muted-foreground">Carrier</p>
                        <p>{order.shipment.carrier}</p>
                      </div>
                    )}
                    {order.shipment.deliveredAt && (
                      <div>
                        <p className="text-muted-foreground">Delivered At</p>
                        <p>{format(new Date(order.shipment.deliveredAt), "dd MMM yyyy")}</p>
                      </div>
                    )}
                  </div>

                  {/* Shipment status update buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Picked Up", value: "picked_up" },
                      { label: "In Transit", value: "in_transit" },
                      { label: "Out for Delivery", value: "out_for_delivery" },
                      { label: "Mark Delivered", value: "delivered" },
                      { label: "Returned", value: "returned" },
                    ].map((action) => (
                      <Button
                        key={action.value}
                        size="sm"
                        variant={order.shipment.status === action.value ? "default" : "outline"}
                        className="text-xs h-7"
                        isLoading={updatingShipment}
                        onClick={() => handleShipmentUpdate(action.value)}
                        disabled={order.shipment.status === action.value}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Address */}
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
              <CardHeader><CardTitle className="text-base">Order Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-xs">#{order.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(new Date(order.createdAt), "dd MMM yyyy")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant[order.status] || "default"} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Buyer</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.buyer?.profile?.fullName || "—"}</p>
                <p className="text-muted-foreground">{order.buyer?.email}</p>
                <p className="text-muted-foreground">{order.buyer?.profile?.phone || "No phone"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Seller</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.seller?.sellerProfile?.shopName || "—"}</p>
                <p className="text-muted-foreground">{order.seller?.profile?.fullName}</p>
                <p className="text-muted-foreground">{order.seller?.email}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}