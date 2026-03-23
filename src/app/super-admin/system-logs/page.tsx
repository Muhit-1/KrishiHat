import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Shield, Users, Settings, ClipboardList } from "lucide-react";

const superAdminLinks = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: <Shield className="h-4 w-4" /> },
  { href: "/super-admin/admins", label: "Admins", icon: <Users className="h-4 w-4" /> },
  { href: "/super-admin/system-logs", label: "System Logs", icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/super-admin/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export default function SystemLogsPage() {
  return (
    <DashboardLayout sidebarLinks={superAdminLinks} sidebarTitle="Super Admin">
      <SectionHeader title="System Logs" />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {["Level", "Message", "Source", "Timestamp"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No logs</td></tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}