import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sprout, Home, ShoppingBag, TrendingUp } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-primary/10 rounded-full p-6 mb-6">
        <Sprout className="h-16 w-16 text-primary" />
      </div>

      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
      <p className="text-muted-foreground mb-2 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <p className="text-muted-foreground text-sm mb-8">
        এই পেজটি খুঁজে পাওয়া যাচ্ছে না।
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Link>
        <Link href="/marketplace">
          <Button variant="outline">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Marketplace
          </Button>
        </Link>
        <Link href="/market-prices">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Prices
          </Button>
        </Link>
      </div>
    </div>
  );
}