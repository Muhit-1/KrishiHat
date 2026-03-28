"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle, Package, ShoppingBag, Gavel, MessageSquare, BarChart2, User, BadgeCheck, FileText } from "lucide-react";

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
  const [profile, setProfile] = useState<any>(null);
  const [nidNumber, setNidNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/seller/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setProfile(json.data);
          setNidNumber(json.data.nidNumber || "");
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/seller/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nidNumber }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <SectionHeader title="Seller Verification" />

      <div className="max-w-lg space-y-6">
        {/* Status card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {profile?.isVerified ? (
                <>
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold">Your shop is verified</p>
                    <p className="text-sm text-muted-foreground">You can publish products and receive orders.</p>
                  </div>
                  <Badge variant="success" className="ml-auto">Verified</Badge>
                </>
              ) : (
                <>
                  <div className="bg-yellow-100 rounded-full p-2">
                    <AlertCircle className="h-6 w-6 text-yellow-700" />
                  </div>
                  <div>
                    <p className="font-semibold">Verification Pending</p>
                    <p className="text-sm text-muted-foreground">Submit your NID to get verified by our admin team.</p>
                  </div>
                  <Badge variant="warning" className="ml-auto">Unverified</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submission form */}
        {!profile?.isVerified && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Submit Verification Documents</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="National ID (NID) Number"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  placeholder="Your NID number"
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Trade License (optional)</label>
                  <input type="file" accept="image/*,.pdf" className="text-sm" />
                  <p className="text-xs text-muted-foreground">Upload image or PDF. Max 5MB.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-md text-xs">
                  After submission, our admin team will review your documents within 1–3 business days and notify you by email.
                </div>

                {saved && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md text-sm">
                    <CheckCircle className="h-4 w-4" /> Information saved! Awaiting admin review.
                  </div>
                )}

                <Button type="submit" isLoading={saving}>Submit for Verification</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}