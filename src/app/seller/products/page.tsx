import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, Gavel, MessageSquare, BarChart2, User, BadgeCheck, FileText } from "lucide-react";

const sellerLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/seller/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/seller/auctions", label: "Auctions", icon: <Gavel className="h-4 w-4" /> },
  { href: "/seller/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/seller/quotes", label: "Quotes", icon: <FileText className="h-4 w-4" /> },
  { href: "/seller/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/seller/verification", label: "Verification", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/seller/profile", label: "Shop Profile", icon: <User className="h-4 w-4" /> },
  { href: "/seller/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
];

export default function SellerProductsPage() {
  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <SectionHeader title="My Products" action={<Button size="sm">+ Add Product</Button>} />
      <EmptyState icon={<Package className="h-12 w-12" />} title="No products yet" description="Add your first product to start selling." action={<Button>Add Product</Button>} />
    </DashboardLayout>
  );
}