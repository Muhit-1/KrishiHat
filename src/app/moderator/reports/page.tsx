import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { AlertCircle, Users, MessageSquare, BarChart2 } from "lucide-react";

const modLinks = [
  { href: "/moderator/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/moderator/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/moderator/disputes", label: "Disputes", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/moderator/users", label: "Users", icon: <Users className="h-4 w-4" /> },
];

export default function ModeratorReportsPage() {
  return (
    <DashboardLayout sidebarLinks={modLinks} sidebarTitle="Moderator Panel">
      <SectionHeader title="User Reports" />
      <EmptyState icon={<AlertCircle className="h-12 w-12" />} title="No open reports" />
    </DashboardLayout>
  );
}