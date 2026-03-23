import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/common/page-container";
import { Sprout, ShoppingBag, Gavel, TrendingUp, Shield, Truck } from "lucide-react";

export default function HomePage() {
  const features = [
    { icon: <ShoppingBag className="h-6 w-6" />, title: "Fresh Products", desc: "Buy direct from verified farmers" },
    { icon: <Gavel className="h-6 w-6" />, title: "Live Auctions", desc: "Bid on used farming equipment" },
    { icon: <TrendingUp className="h-6 w-6" />, title: "Market Prices", desc: "Daily live commodity prices" },
    { icon: <Shield className="h-6 w-6" />, title: "Safe Trading", desc: "Verified sellers and buyers" },
    { icon: <Truck className="h-6 w-6" />, title: "Delivery Tracking", desc: "Track your orders in real time" },
    { icon: <Sprout className="h-6 w-6" />, title: "Support Farmers", desc: "Helping Bangladeshi agriculture" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="krishi-gradient text-white py-20">
        <PageContainer>
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Fresh from the Farm,<br />Direct to You
            </h1>
            <p className="text-lg opacity-90 mb-8">
              বাংলাদেশের সবচেয়ে বড় কৃষি মার্কেটপ্লেসে স্বাগতম।
              Buy and sell agricultural products across Bangladesh.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/marketplace">
                <Button size="lg" variant="secondary">Explore Marketplace</Button>
              </Link>
              <Link href="/auctions">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Auctions
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Features */}
      <PageContainer className="py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Why KrishiHat?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-primary mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>

      {/* CTA */}
      <section className="bg-muted py-16">
        <PageContainer className="text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to start selling?</h2>
          <p className="text-muted-foreground mb-6">Join thousands of farmers already on KrishiHat.</p>
          <Link href="/signup?role=seller">
            <Button size="lg">Become a Seller</Button>
          </Link>
        </PageContainer>
      </section>
    </>
  );
}