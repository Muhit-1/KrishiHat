"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/features/cart/hooks/use-cart";
import { ShoppingCart, Trash2, ShoppingBag, MessageSquare, MapPin } from "lucide-react";
import Link from "next/link";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
];

export default function CartPage() {
  const { cart, loading, removeItem, updateQty, total } = useCart();

  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader title="Your Cart" />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !cart?.items?.length ? (
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="Your cart is empty"
          description="Add products from the marketplace."
          action={<Link href="/marketplace"><Button>Browse Marketplace</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {cart.items.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-4 items-center">
                <div className="h-16 w-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                  {item.product?.images?.[0] && (
                    <img src={item.product.images[0].url} className="h-full w-full object-cover" alt="" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product?.title}</p>
                  <p className="text-primary font-bold">৳ {Number(item.product?.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                    className="w-7 h-7 rounded border flex items-center justify-center hover:bg-muted"
                  >−</button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded border flex items-center justify-center hover:bg-muted"
                  >+</button>
                </div>
                <p className="font-bold w-20 text-right">৳ {(Number(item.product?.price) * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeItem(item.id)} className="text-destructive hover:opacity-70">
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}

          {/* Summary */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary ml-4">৳ {total.toFixed(2)}</span>
              </div>
              <Link href="/buyer/checkout">
                <Button size="lg">Proceed to Checkout</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}