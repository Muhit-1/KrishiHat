import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Settings, ClipboardList } from "lucide-react";

const superAdminLinks = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: <Shield className="h-4 w-4" /> },
  { href: "/super-admin/admins", label: "Admins", icon: <Users className="h-4 w-4" /> },
  { href: "/super-admin/system-logs", label: "System Logs", icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/super-admin/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export default function SuperAdminDashboardPage() {
  return (
    <DashboardLayout sidebarLinks={superAdminLinks} sidebarTitle="Super Admin">
      <SectionHeader title="Super Admin Dashboard" subtitle="Full platform control" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Total Admins", "Active Moderators", "System Health", "Uptime"].map((label) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">—</div></CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}