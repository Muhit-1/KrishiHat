import Link from "next/link";
import { Sprout } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="page-container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
              <Sprout className="h-5 w-5" />
              KrishiHat
            </Link>
            <p className="text-sm text-muted-foreground">
              Bangladesh&apos;s trusted agricultural marketplace connecting farmers and buyers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-foreground">Browse Products</Link></li>
              <li><Link href="/auctions" className="hover:text-foreground">Auctions</Link></li>
              <li><Link href="/market-prices" className="hover:text-foreground">Market Prices</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Login</Link></li>
              <li><Link href="/signup" className="hover:text-foreground">Sign Up</Link></li>
              <li><Link href="/buyer/orders" className="hover:text-foreground">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Sell</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/signup?role=seller" className="hover:text-foreground">Become a Seller</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-foreground">Seller Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} KrishiHat. All rights reserved. | Made with ❤️ for Bangladesh farmers.
        </div>
      </div>
    </footer>
  );
}