import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Users, Settings, ClipboardList } from "lucide-react";

const superAdminLinks = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: <Shield className="h-4 w-4" /> },
  { href: "/super-admin/admins", label: "Admins", icon: <Users className="h-4 w-4" /> },
  { href: "/super-admin/system-logs", label: "System Logs", icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/super-admin/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export default function SuperAdminSettingsPage() {
  return (
    <DashboardLayout sidebarLinks={superAdminLinks} sidebarTitle="Super Admin">
      <SectionHeader title="Platform Settings" />
      <Card className="max-w-lg">
        <CardContent className="p-6 space-y-4">
          <Input label="Platform Name" defaultValue="KrishiHat" />
          <Input label="Support Email" defaultValue="support@krishihat.com" />
          <Input label="Default Locale" defaultValue="en" />
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}