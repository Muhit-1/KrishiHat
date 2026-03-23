import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { MessageSquare, ShoppingBag, ShoppingCart, MapPin } from "lucide-react";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
];

export default function BuyerChatPage() {
  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader title="Messages" />
      <EmptyState icon={<MessageSquare className="h-12 w-12" />} title="No conversations yet" description="Start a conversation from a product page." />
    </DashboardLayout>
  );
}