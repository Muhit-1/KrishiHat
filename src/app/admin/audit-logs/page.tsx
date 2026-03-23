import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Users, Package, ShoppingBag, CreditCard, Tag, TrendingUp, Truck, AlertCircle, ClipboardList } from "lucide-react";

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

export default function AuditLogsPage() {
  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Audit Logs" subtitle="Track all admin and system actions" />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {["User", "Action", "Entity", "Entity ID", "IP", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No logs found</td></tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}