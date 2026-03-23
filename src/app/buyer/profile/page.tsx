import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCart, MessageSquare, MapPin } from "lucide-react";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
];

export default function BuyerProfilePage() {
  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader title="My Profile" />
      <Card className="max-w-lg">
        <CardContent className="p-6 space-y-4">
          <Input label="Full Name" defaultValue="Demo Buyer" />
          <Input label="Email" type="email" defaultValue="buyer@krishihat.com" disabled />
          <Input label="Phone" defaultValue="01722222222" />
          <Input label="Address" placeholder="Your address" />
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}