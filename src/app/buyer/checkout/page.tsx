"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/cart.schema";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import {
  ShoppingBag,
  ShoppingCart,
  MessageSquare,
  MapPin,
  Flag,
  CheckCircle,
  Smartphone,
  Banknote,
  Package,
  Home,
} from "lucide-react";
import { useCart } from "@/features/cart/hooks/use-cart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/reports", label: "Reports", icon: <Flag className="h-4 w-4" /> },
];

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    labelBn: "ক্যাশ অন ডেলিভারি",
    description: "Pay when your order arrives",
    icon: <Banknote className="h-5 w-5" />,
    color: "border-green-200 bg-green-50",
    selectedColor: "border-green-500 bg-green-50",
  },
  {
    id: "bkash",
    label: "bKash",
    labelBn: "বিকাশ",
    description: "Pay via bKash mobile banking",
    icon: <Smartphone className="h-5 w-5 text-pink-600" />,
    color: "border-pink-200 bg-pink-50",
    selectedColor: "border-pink-500 bg-pink-50",
    mockNumber: "01700-000000 (Demo)",
  },
  {
    id: "nagad",
    label: "Nagad",
    labelBn: "নগদ",
    description: "Pay via Nagad mobile banking",
    icon: <Smartphone className="h-5 w-5 text-orange-600" />,
    color: "border-orange-200 bg-orange-50",
    selectedColor: "border-orange-500 bg-orange-50",
    mockNumber: "01700-111111 (Demo)",
  },
] as const;

type PaymentMethodId = "cod" | "bkash" | "nagad";

type SavedAddress = {
  id: string;
  label: string;
  fullAddress: string;
  district: string;
  upazila?: string;
  phone?: string;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const { cart, loading: cartLoading, total } = useCart();
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>("cod");
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cod", deliveryAddress: "" },
  });

  // Fetch saved addresses and prefill default
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/users/addresses");
        const json = await res.json();
        if (json.success) {
          const addresses: SavedAddress[] = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.data?.addresses)
            ? json.data.addresses
            : [];

          setSavedAddresses(addresses);

          // Auto-select and fill default address
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            const formatted = buildAddressString(defaultAddr);
            setValue("deliveryAddress", formatted);
          }
        }
      } catch {
        // silently fail — user can type manually
      } finally {
        setAddressesLoading(false);
      }
    };
    fetchAddresses();
  }, [setValue]);

  const buildAddressString = (addr: SavedAddress): string => {
    const parts = [addr.fullAddress];
    if (addr.upazila) parts.push(addr.upazila);
    parts.push(addr.district);
    if (addr.phone) parts.push(`Phone: ${addr.phone}`);
    return parts.join(", ");
  };

  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setValue("deliveryAddress", buildAddressString(addr), { shouldValidate: true });
  };

  // Sync payment method to form
  useEffect(() => {
    setValue("paymentMethod", selectedPayment);
  }, [selectedPayment, setValue]);

  const onSubmit = async (data: CheckoutInput) => {
    setServerError(null);
    setPlacing(true);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        const orderId = json.data.orders?.[0]?.id;
        router.push(`/buyer/checkout/success?orderId=${orderId}&paid=${json.data.isPaid}`);
      } else {
        setServerError(json.message || "Checkout failed. Please try again.");
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedPayment);

  if (cartLoading) {
    return (
      <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
        <SectionHeader title="Checkout" />
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  if (!cart?.items?.length) {
    return (
      <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
        <SectionHeader title="Checkout" />
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="Your cart is empty"
          action={
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader title="Checkout" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid md:grid-cols-3 gap-6">

          {/* Left — delivery + payment */}
          <div className="md:col-span-2 space-y-5">

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Saved addresses selector */}
                {addressesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Select a saved address:
                    </p>
                    <div className="grid gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectAddress(addr)}
                          className={cn(
                            "w-full text-left rounded-lg border-2 px-4 py-3 transition-all",
                            selectedAddressId === addr.id
                              ? "border-primary bg-primary/5"
                              : "border-input bg-background hover:bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                selectedAddressId === addr.id
                                  ? "border-primary"
                                  : "border-muted-foreground"
                              )}
                            >
                              {selectedAddressId === addr.id && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <Home className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{addr.label}</span>
                                {addr.isDefault && (
                                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {addr.fullAddress}
                                {addr.upazila ? `, ${addr.upazila}` : ""}, {addr.district}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex-1 border-t" />
                      <span>or enter a new address below</span>
                      <div className="flex-1 border-t" />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No saved addresses found.{" "}
                    <Link href="/buyer/addresses" className="text-primary underline hover:no-underline">
                      Add one
                    </Link>{" "}
                    or enter below.
                  </p>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Full Address *</label>
                  <textarea
                    {...register("deliveryAddress")}
                    rows={3}
                    placeholder="House number, Road, Area, District..."
                    className={cn(
                      "px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none",
                      errors.deliveryAddress ? "border-destructive" : "border-input"
                    )}
                  />
                  {errors.deliveryAddress && (
                    <p className="text-xs text-destructive">{errors.deliveryAddress.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Order Note (optional)</label>
                  <textarea
                    {...register("note")}
                    rows={2}
                    placeholder="Special instructions for the seller..."
                    className="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input type="hidden" {...register("paymentMethod")} />

                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={cn(
                      "w-full text-left rounded-lg border-2 p-4 transition-all",
                      selectedPayment === method.id
                        ? method.selectedColor + " border-opacity-100"
                        : "border-input bg-background hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          selectedPayment === method.id
                            ? "border-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {selectedPayment === method.id && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {method.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {method.label}
                          <span className="ml-2 font-normal text-muted-foreground text-xs">
                            {method.labelBn}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Mock bKash/Nagad transaction form */}
                {(selectedPayment === "bkash" || selectedPayment === "nagad") && (
                  <div
                    className={cn(
                      "rounded-lg border-2 p-4 space-y-3",
                      selectedPayment === "bkash"
                        ? "border-pink-300 bg-pink-50"
                        : "border-orange-300 bg-orange-50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded",
                          selectedPayment === "bkash"
                            ? "bg-pink-200 text-pink-800"
                            : "bg-orange-200 text-orange-800"
                        )}
                      >
                        DEMO
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">
                          Send ৳{total.toFixed(2)} to:
                        </p>
                        <p className="font-mono mt-0.5">
                          {selectedMethod && "mockNumber" in selectedMethod
                            ? selectedMethod.mockNumber
                            : ""}
                        </p>
                        <p className="mt-1">
                          After sending, enter the Transaction ID below.
                        </p>
                      </div>
                    </div>

                    <Input
                      label={`${selectedPayment === "bkash" ? "bKash" : "Nagad"} Transaction ID *`}
                      placeholder="e.g. 8N7A6B5C4D"
                      error={errors.transactionId?.message}
                      {...register("transactionId")}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right — order summary */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Cart items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <div className="h-10 w-10 bg-muted rounded flex-shrink-0 overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0].url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 m-auto mt-2.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.product?.title}</p>
                        <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold">
                        ৳{(Number(item.product?.price) * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>৳{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-700">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedPayment}
                    </Badge>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">৳{total.toFixed(2)}</span>
                  </div>
                </div>

                {serverError && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {serverError}
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" isLoading={placing}>
                  {placing ? "Placing Order..." : `Place Order — ৳${total.toFixed(2)}`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By placing this order you agree to our terms of service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}