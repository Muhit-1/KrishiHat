"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { AlertCircle, Users, MessageSquare, BarChart2, Search } from "lucide-react";
import { format } from "date-fns";

const modLinks = [
  { href: "/moderator/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/moderator/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/moderator/disputes", label: "Disputes", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/moderator/users", label: "Users", icon: <Users className="h-4 w-4" /> },
];

const statusVariant: Record<string, any> = {
  active: "success", suspended: "warning", banned: "danger", pending_verification: "info",
};

export default function ModeratorUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [suspending, setSuspending] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (searchQuery) params.set("q", searchQuery);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setUsers(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [searchQuery, roleFilter, statusFilter]);

  const handleSuspend = async (id: string, action: "suspend" | "unsuspend") => {
    setSuspending(id);
    await fetch(`/api/admin/users/${id}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setSuspending(null);
    fetchUsers();
  };

  return (
    <DashboardLayout sidebarLinks={modLinks} sidebarTitle="Moderator Panel">
      <SectionHeader title="User Management" subtitle={`${total} users`} />

      {/* Search and filters */}
      <div className="flex gap-3 flex-wrap mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchQuery(search)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 h-9 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button size="sm" onClick={() => setSearchQuery(search)}>Search</Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        <div className="flex gap-1">
          {["", "buyer", "seller"].map((r) => (
            <Button key={r} size="sm" variant={roleFilter === r ? "default" : "outline"} onClick={() => setRoleFilter(r)} className="capitalize text-xs h-7">
              {r || "All Roles"}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {["", "active", "suspended"].map((s) => (
            <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="capitalize text-xs h-7">
              {s || "All Status"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users className="h-12 w-12" />} title="No users found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-sm">{user.profile?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[user.status] || "default"} className="text-xs capitalize">
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(user.createdAt), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    {user.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        isLoading={suspending === user.id}
                        onClick={() => handleSuspend(user.id, "suspend")}
                      >
                        Suspend
                      </Button>
                    ) : user.status === "suspended" ? (
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs"
                        isLoading={suspending === user.id}
                        onClick={() => handleSuspend(user.id, "unsuspend")}
                      >
                        Unsuspend
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}