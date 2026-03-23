import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gavel, Package, ShoppingBag, MessageSquare, BarChart2, User, BadgeCheck, FileText } from "lucide-react";

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

export default function SellerVerificationPage() {
  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <SectionHeader title="Seller Verification" />
      <Card className="max-w-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge variant="warning">Pending Verification</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Submit your NID and trade license to get verified. Verified sellers get a badge and higher visibility.
          </p>
          <Input label="NID Number" placeholder="Your national ID number" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Trade License (optional)</label>
            <input type="file" accept="image/*,.pdf" className="text-sm" />
          </div>
          <Button>Submit for Verification</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}