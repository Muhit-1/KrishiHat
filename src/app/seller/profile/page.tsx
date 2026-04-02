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
import {
  CheckCircle,
  AlertCircle,
  Package,
  ShoppingBag,
  Gavel,
  MessageSquare,
  BarChart2,
  User,
  BadgeCheck,
} from "lucide-react";

const sellerLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/seller/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/seller/auctions", label: "Auctions", icon: <Gavel className="h-4 w-4" /> },
  { href: "/seller/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/seller/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/seller/profile", label: "Shop Profile", icon: <User className="h-4 w-4" /> },
  { href: "/seller/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
];

const sellerProfileSchema = z.object({
  shopName: z.string().min(2, "Shop name too short"),
  shopDescription: z.string().optional(),
  nidNumber: z.string().optional(),
});

type SellerProfileForm = z.infer<typeof sellerProfileSchema>;

export default function SellerProfilePage() {
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [nidSaving, setNidSaving] = useState(false);
  const [nidSaved, setNidSaved] = useState(false);
  const [nidNumber, setNidNumber] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SellerProfileForm>({
    resolver: zodResolver(sellerProfileSchema),
  });

  const fetchProfile = () => {
    fetch("/api/seller/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setProfileData(json.data);
          setNidNumber(json.data.nidNumber || "");
          reset({
            shopName: json.data.shopName || "",
            shopDescription: json.data.shopDescription || "",
            nidNumber: json.data.nidNumber || "",
          });
        }
      });
  };

  useEffect(() => {
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: SellerProfileForm) => {
    setServerError(null);
    setSaved(false);
    const res = await fetch("/api/seller/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setSaved(true);
      setProfileData((prev: any) => ({ ...prev, ...json.data }));
      setTimeout(() => setSaved(false), 3000);
    } else {
      setServerError(json.message);
    }
  };

  const handleNidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNidSaving(true);
    setNidSaved(false);
    const res = await fetch("/api/seller/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nidNumber }),
    });
    const json = await res.json();
    setNidSaving(false);
    if (json.success) {
      setNidSaved(true);
      setProfileData((prev: any) => ({ ...prev, nidNumber }));
      setTimeout(() => setNidSaved(false), 3000);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const form = new FormData();
    form.append("logo", file);
    const res = await fetch("/api/seller/logo", { method: "POST", body: form });
    const json = await res.json();
    if (json.success) {
      setProfileData((prev: any) => ({ ...prev, shopLogoUrl: json.data.shopLogoUrl }));
    }
    setLogoUploading(false);
    e.target.value = "";
  };

  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <SectionHeader title="Shop Profile" />

      <div className="max-w-lg space-y-6">

        {/* Shop Logo */}
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-primary/20">
              {profileData?.shopLogoUrl ? (
                <img
                  src={profileData.shopLogoUrl}
                  alt="logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl">🌾</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  {profileData?.shopName || "Your Shop"}
                </p>
                {profileData?.isVerified && (
                  <Badge variant="success" className="text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <label className="mt-1 cursor-pointer inline-block">
                <span className="text-xs text-primary hover:underline">
                  {logoUploading ? "Uploading..." : "Change logo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Shop Info Form */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Shop Information</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Shop Name"
                error={errors.shopName?.message}
                {...register("shopName")}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Shop Description</label>
                <textarea
                  {...register("shopDescription")}
                  rows={4}
                  placeholder="Describe your shop and what you sell..."
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {saved && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md text-sm">
                  <CheckCircle className="h-4 w-4" /> Profile saved successfully!
                </div>
              )}
              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}

              <Button type="submit" isLoading={isSubmitting}>
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Verification Section — merged from /seller/verification */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Verification Status</h3>

            {/* Status indicator */}
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
              {profileData?.isVerified ? (
                <>
                  <div className="bg-green-100 rounded-full p-1.5">
                    <CheckCircle className="h-5 w-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Your shop is verified</p>
                    <p className="text-xs text-muted-foreground">
                      You can publish products and receive orders.
                    </p>
                  </div>
                  <Badge variant="success">Verified</Badge>
                </>
              ) : (
                <>
                  <div className="bg-yellow-100 rounded-full p-1.5">
                    <AlertCircle className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Verification Pending</p>
                    <p className="text-xs text-muted-foreground">
                      Submit your NID to get verified by our admin team.
                    </p>
                  </div>
                  <Badge variant="warning">Unverified</Badge>
                </>
              )}
            </div>

            {/* NID submission — only shown when not yet verified */}
            {!profileData?.isVerified && (
              <form onSubmit={handleNidSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    National ID (NID) Number
                  </label>
                  <input
                    type="text"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    placeholder="Your NID number"
                    className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Trade License{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload image or PDF. Max 5MB.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-md text-xs">
                  After submission, our admin team will review your documents
                  within 1–3 business days and notify you by email.
                </div>

                {nidSaved && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md text-sm">
                    <CheckCircle className="h-4 w-4" /> Information saved! Awaiting
                    admin review.
                  </div>
                )}

                <Button type="submit" isLoading={nidSaving}>
                  Submit for Verification
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}