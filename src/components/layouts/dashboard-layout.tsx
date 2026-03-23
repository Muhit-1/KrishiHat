import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarLinks: { href: string; label: string; icon?: React.ReactNode }[];
  sidebarTitle?: string;
}

export function DashboardLayout({ children, sidebarLinks, sidebarTitle }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar links={sidebarLinks} title={sidebarTitle} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}