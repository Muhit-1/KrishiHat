"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  Tag,
  TrendingUp,
  Truck,
  AlertCircle,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

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
  active: "success",
  suspended: "warning",
  banned: "destructive",
  pending_verification: "info",
};

type User = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  profile?: {
    fullName?: string | null;
  } | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/users?limit=500", {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success) {
        setUsers(json.data.items || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  const handleSuspend = async (id: string, action: "suspend" | "unsuspend") => {
    const previousUsers = users;

    try {
      setUpdating(id);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                status: action === "suspend" ? "suspended" : "active",
              }
            : user
        )
      );

      const res = await fetch(`/api/admin/users/${id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setUsers(previousUsers);
        return;
      }

      fetchUsers();
    } catch (error) {
      setUsers(previousUsers);
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(users.length / rowsPerPage));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = currentPage * rowsPerPage;
    return users.slice(start, end);
  }, [users, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Users" subtitle="Manage all platform users" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Show
          </span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={75}>75</option>
          </select>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchUsers}
          className="ml-auto"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Showing {paginatedUsers.length} of {users.length} users
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-background">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">
                        {u.profile?.fullName || "—"}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {u.email}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {u.role}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={statusVariant[u.status] || "default"}
                          className="capitalize"
                        >
                          {u.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(u.createdAt), "dd MMM yyyy")}
                      </td>

                      <td className="px-4 py-3">
                        {u.status === "active" && !["admin", "super_admin"].includes(u.role) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={updating === u.id}
                            onClick={() => handleSuspend(u.id, "suspend")}
                          >
                            {updating === u.id ? "Updating..." : "Suspend"}
                          </Button>
                        )}

                        {u.status === "suspended" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updating === u.id}
                            onClick={() => handleSuspend(u.id, "unsuspend")}
                          >
                            {updating === u.id ? "Updating..." : "Unsuspend"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-center">
            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="min-w-9 h-9 rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-9 h-9 rounded-md border px-3 text-sm transition-colors ${
                        currentPage === page
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="min-w-9 h-9 rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Page - 1</p>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}