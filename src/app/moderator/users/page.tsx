import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { AlertCircle, Users, MessageSquare, BarChart2 } from "lucide-react";

const modLinks = [
  { href: "/moderator/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/moderator/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/moderator/disputes", label: "Disputes", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/moderator/users", label: "Users", icon: <Users className="h-4 w-4" /> },
];

export default function ModeratorUsersPage() {
  return (
    <DashboardLayout sidebarLinks={modLinks} sidebarTitle="Moderator Panel">
      <SectionHeader title="User Management" />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {["User", "Email", "Role", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users</td></tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}