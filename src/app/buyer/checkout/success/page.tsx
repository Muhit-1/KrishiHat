"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const isPaid = searchParams.get("paid") === "true";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8 space-y-5">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-green-800">Order Placed!</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Your order has been successfully placed.
            </p>
          </div>

          {orderId && (
            <div className="bg-muted rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-mono font-bold text-sm mt-0.5">
                #{orderId.slice(-10).toUpperCase()}
              </p>
            </div>
          )}

          {/* Payment status */}
          <div className={`rounded-lg px-4 py-3 ${isPaid ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
            <p className={`text-sm font-semibold ${isPaid ? "text-green-800" : "text-yellow-800"}`}>
              {isPaid ? "✓ Payment Confirmed" : "⏳ Payment Pending"}
            </p>
            <p className={`text-xs mt-0.5 ${isPaid ? "text-green-700" : "text-yellow-700"}`}>
              {isPaid
                ? "Your payment has been recorded successfully."
                : "Pay on delivery when your order arrives."}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
           Seller will contact you within 24 hours via Mail
          </p>

          <div className="flex gap-3">
            <Link href="/buyer/orders" className="flex-1">
              <Button className="w-full" variant="default">
                <ShoppingBag className="h-4 w-4 mr-2" />
                View Orders
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full" variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}