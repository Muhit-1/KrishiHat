"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Shield, Users, Settings, ClipboardList, UserPlus } from "lucide-react";
import { format } from "date-fns";

const superAdminLinks = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: <Shield className="h-4 w-4" /> },
  { href: "/super-admin/admins", label: "Admins & Moderators", icon: <Users className="h-4 w-4" /> },
  { href: "/super-admin/system-logs", label: "System Logs", icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/super-admin/settings", label: "Platform Settings", icon: <Settings className="h-4 w-4" /> },
];

const createSchema = z.object({
  fullName: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["admin", "moderator"]),
});

type CreateForm = z.infer<typeof createSchema>;

const statusVariant: Record<string, any> = {
  active: "success", suspended: "warning", banned: "danger",
};

const roleColor: Record<string, string> = {
  admin: "bg-blue-100 text-blue-800",
  moderator: "bg-purple-100 text-purple-800",
};

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: "admin" },
  });

  const fetchAdmins = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (roleFilter) params.set("role", roleFilter);

    fetch(`/api/super-admin/admins?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setAdmins(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, [roleFilter]);

  const onSubmit = async (data: CreateForm) => {
    setServerError(null);
    const res = await fetch("/api/super-admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      reset();
      setIsModalOpen(false);
      fetchAdmins();
    } else {
      setServerError(json.message);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    setUpdating(id);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await fetch(`/api/super-admin/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(null);
    fetchAdmins();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this account? This cannot be undone.")) return;
    setUpdating(id);
    await fetch(`/api/super-admin/admins/${id}`, { method: "DELETE" });
    setUpdating(null);
    fetchAdmins();
  };

  return (
    <DashboardLayout sidebarLinks={superAdminLinks} sidebarTitle="Super Admin">
      <SectionHeader
        title="Admins & Moderators"
        subtitle={`${total} staff accounts`}
        action={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Create Account
          </Button>
        }
      />

      {/* Role filter */}
      <div className="flex gap-2 mb-5">
        {["", "admin", "moderator"].map((r) => (
          <Button
            key={r}
            size="sm"
            variant={roleFilter === r ? "default" : "outline"}
            onClick={() => setRoleFilter(r)}
            className="capitalize text-xs"
          >
            {r || "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : admins.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No staff accounts found"
          action={<Button onClick={() => setIsModalOpen(true)}>Create First Admin</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Name", "Email", "Role", "Status", "Verified", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {admins.map((admin: any) => (
                <tr key={admin.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-sm">{admin.profile?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{admin.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColor[admin.role] || ""}`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[admin.status] || "default"} className="text-xs capitalize">
                      {admin.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={admin.emailVerified ? "success" : "warning"} className="text-xs">
                      {admin.emailVerified ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(admin.createdAt), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={admin.status === "active" ? "outline" : "default"}
                        className="h-6 px-2 text-xs"
                        isLoading={updating === admin.id}
                        onClick={() => handleStatusToggle(admin.id, admin.status)}
                      >
                        {admin.status === "active" ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 px-2 text-xs"
                        isLoading={updating === admin.id}
                        onClick={() => handleDelete(admin.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); setServerError(null); }}
        title="Create Staff Account"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Full Name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone (optional)"
            type="tel"
            {...register("phone")}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Role *</label>
            <select
              {...register("role")}
              className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />

          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {serverError}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">Create Account</Button>
            <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); reset(); setServerError(null); }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}