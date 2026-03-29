"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Users, Settings, ClipboardList, CheckCircle, AlertCircle } from "lucide-react";

const superAdminLinks = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: <Shield className="h-4 w-4" /> },
  { href: "/super-admin/admins", label: "Admins & Moderators", icon: <Users className="h-4 w-4" /> },
  { href: "/super-admin/system-logs", label: "System Logs", icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/super-admin/settings", label: "Platform Settings", icon: <Settings className="h-4 w-4" /> },
];

const settingsSchema = z.object({
  platformName: z.string().min(2),
  platformNameBn: z.string().min(2),
  supportEmail: z.string().email(),
  supportPhone: z.string().optional(),
  defaultLocale: z.enum(["en", "bn"]),
  maintenanceMode: z.boolean(),
  allowNewRegistrations: z.boolean(),
  maxProductImagesPerListing: z.coerce.number().int().min(1).max(20),
  deliveryChargeDefault: z.coerce.number().min(0),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SuperAdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    fetch("/api/super-admin/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          reset(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: SettingsForm) => {
    setServerError(null);
    setSaved(false);
    const res = await fetch("/api/super-admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } else {
      setServerError(json.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={superAdminLinks} sidebarTitle="Super Admin">
        <SectionHeader title="Platform Settings" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={superAdminLinks} sidebarTitle="Super Admin">
      <SectionHeader title="Platform Settings" subtitle="Configure platform-wide settings" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-6">

        {/* General Settings */}
        <Card>
          <CardHeader><CardTitle className="text-base">General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Platform Name (English)"
                error={errors.platformName?.message}
                {...register("platformName")}
              />
              <Input
                label="Platform Name (Bengali)"
                error={errors.platformNameBn?.message}
                {...register("platformNameBn")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Support Email"
                type="email"
                error={errors.supportEmail?.message}
                {...register("supportEmail")}
              />
              <Input
                label="Support Phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                {...register("supportPhone")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Default Language</label>
              <select
                {...register("defaultLocale")}
                className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring w-48"
              >
                <option value="en">English</option>
                <option value="bn">Bengali (বাংলা)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Registration & Maintenance */}
        <Card>
          <CardHeader><CardTitle className="text-base">Access Control</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("allowNewRegistrations")}
                className="h-4 w-4 rounded border-input"
              />
              <div>
                <p className="text-sm font-medium">Allow new registrations</p>
                <p className="text-xs text-muted-foreground">When disabled, new buyer/seller signups are blocked</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("maintenanceMode")}
                className="h-4 w-4 rounded border-input"
              />
              <div>
                <p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Shows a maintenance message to all non-admin users</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Marketplace Settings */}
        <Card>
          <CardHeader><CardTitle className="text-base">Marketplace</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Product Images per Listing"
                type="number"
                min="1"
                max="20"
                error={errors.maxProductImagesPerListing?.message}
                {...register("maxProductImagesPerListing")}
              />
              <Input
                label="Default Delivery Charge (৳)"
                type="number"
                step="0.01"
                min="0"
                error={errors.deliveryChargeDefault?.message}
                {...register("deliveryChargeDefault")}
              />
            </div>
          </CardContent>
        </Card>

        {saved && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Settings saved!</p>
              <p className="text-xs">Platform settings have been updated successfully.</p>
            </div>
          </div>
        )}

        {serverError && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{serverError}</p>
          </div>
        )}

        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Save All Settings
        </Button>
      </form>
    </DashboardLayout>
  );
}