"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, ShoppingCart, MessageSquare, MapPin } from "lucide-react";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
];

export default function CheckoutPage() {
  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader title="Checkout" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Delivery Address</h3>
              <Input label="Full Address" placeholder="House, Road, Area, District..." />
              <Input label="Phone" type="tel" placeholder="01XXXXXXXXX" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Payment Method</label>
                <select className="h-10 px-3 rounded-md border border-input text-sm">
                  <option value="cod">Cash on Delivery</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>৳ 0</span></div>
            <div className="flex justify-between text-sm"><span>Delivery</span><span>৳ 0</span></div>
            <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>৳ 0</span></div>
            <Button className="w-full">Place Order</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}