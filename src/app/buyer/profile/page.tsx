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
import {
  ShoppingBag,
  ShoppingCart,
  MessageSquare,
  MapPin,
  Flag,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/reports", label: "Reports", icon: <Flag className="h-4 w-4" /> },
];

const profileSchema = z.object({
  fullName: z.string().min(2, "Name too short"),
  phone: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function BuyerProfilePage() {
  const { user, refetch } = useAuth();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          reset({
            fullName: json.data.fullName || "",
            phone: json.data.phone || "",
            division: json.data.division || "",
            district: json.data.district || "",
            upazila: json.data.upazila || "",
          });
        }
      });
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    setServerError(null);
    setSaved(false);

    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (json.success) {
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 3000);
    } else {
      setServerError(json.message);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);

    const form = new FormData();
    form.append("avatar", file);

    const res = await fetch("/api/users/avatar", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    if (json.success) refetch();

    setAvatarLoading(false);
  };

  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader title="My Profile" />

      <div className="max-w-lg space-y-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              <span className="text-2xl font-bold text-primary">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <label className="mt-1 inline-block cursor-pointer">
                <span className="text-xs text-primary hover:underline">
                  {avatarLoading ? "Uploading..." : "Change photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarLoading}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                error={errors.fullName?.message}
                {...register("fullName")}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  value={user?.email || ""}
                  disabled
                  className="h-10 cursor-not-allowed rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                />
              </div>

              <Input
                label="Phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                {...register("phone")}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Division"
                  placeholder="e.g. Dhaka"
                  {...register("division")}
                />
                <Input
                  label="District"
                  placeholder="e.g. Dhaka"
                  {...register("district")}
                />
              </div>

              <Input
                label="Upazila / Thana"
                placeholder="e.g. Mirpur"
                {...register("upazila")}
              />

              {saved && (
                <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Profile saved successfully!
                </div>
              )}

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}

              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}