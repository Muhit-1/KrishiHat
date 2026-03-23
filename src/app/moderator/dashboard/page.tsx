import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Users, MessageSquare, BarChart2 } from "lucide-react";

const modLinks = [
  { href: "/moderator/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/moderator/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/moderator/disputes", label: "Disputes", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/moderator/users", label: "Users", icon: <Users className="h-4 w-4" /> },
];

export default function ModeratorDashboardPage() {
  return (
    <DashboardLayout sidebarLinks={modLinks} sidebarTitle="Moderator Panel">
      <SectionHeader title="Moderator Dashboard" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["Open Reports", "Active Disputes", "Pending Reviews"].map((label) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">0</div></CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}