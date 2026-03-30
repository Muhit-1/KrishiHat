"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  ShoppingBag, ShoppingCart, MessageSquare,
  MapPin, Flag, Plus, Trash2, Home,
} from "lucide-react";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/reports", label: "Reports", icon: <Flag className="h-4 w-4" /> },
];

const addressSchema = z.object({
  label: z.string().min(1, "Label required"),
  fullAddress: z.string().min(10, "Address too short"),
  district: z.string().min(1, "District required"),
  upazila: z.string().optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type AddressForm = z.infer<typeof addressSchema>;

const BD_DISTRICTS = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna",
  "Barisal", "Rangpur", "Mymensingh", "Comilla", "Gazipur",
  "Narayanganj", "Tangail", "Bogura", "Jessore", "Noakhali",
  "Dinajpur", "Pabna", "Jashore", "Faridpur", "Brahmanbaria",
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false },
  });

  const fetchAddresses = () => {
    setLoading(true);

    fetch("/api/users/addresses")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setAddresses([]);
          return;
        }

        const nextAddresses = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.addresses)
            ? json.data.addresses
            : [];

        setAddresses(nextAddresses);
      })
      .catch(() => {
        setAddresses([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, []);

  const onSubmit = async (data: AddressForm) => {
    const res = await fetch("/api/users/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      success("Address saved!");
      setIsModalOpen(false);
      reset();
      fetchAddresses();
    } else {
      error("Failed", json.message);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const res = await fetch("/api/users/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) {
      success("Address deleted");
      fetchAddresses();
    } else {
      error("Failed to delete");
    }
    setDeleting(null);
  };

  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader
        title="Delivery Addresses"
        action={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-36 w-full rounded-lg" />)}
        </div>
      ) : !Array.isArray(addresses) || addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-12 w-12" />}
          title="No addresses saved"
          description="Add delivery addresses for faster checkout."
          action={
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Address
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr: any) => (
            <Card key={addr.id} className={addr.isDefault ? "border-primary" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <Badge variant="success" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    isLoading={deleting === addr.id}
                    onClick={() => handleDelete(addr.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{addr.fullAddress}</p>
                <p className="text-sm text-muted-foreground">
                  {addr.upazila && `${addr.upazila}, `}{addr.district}
                </p>
                {addr.phone && (
                  <p className="text-xs text-muted-foreground mt-1">📞 {addr.phone}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title="Add New Address"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Label (e.g. Home, Office)"
            error={errors.label?.message}
            {...register("label")}
            placeholder="Home"
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Full Address *</label>
            <textarea
              {...register("fullAddress")}
              rows={3}
              placeholder="House, Road, Area..."
              className="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            {errors.fullAddress && (
              <p className="text-xs text-destructive">{errors.fullAddress.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">District *</label>
              <select
                {...register("district")}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select district</option>
                {BD_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.district && (
                <p className="text-xs text-destructive">{errors.district.message}</p>
              )}
            </div>
            <Input
              label="Upazila / Thana"
              {...register("upazila")}
              placeholder="e.g. Mirpur"
            />
          </div>

          <Input
            label="Phone for this address"
            type="tel"
            {...register("phone")}
            placeholder="01XXXXXXXXX"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              {...register("isDefault")}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="isDefault" className="text-sm cursor-pointer">
              Set as default address
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Save Address
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsModalOpen(false); reset(); }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}