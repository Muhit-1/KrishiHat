import Link from "next/link";
import { Sprout } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="page-container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-primary mb-3"
            >
              <Sprout className="h-5 w-5" />
              KrishiHat
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bangladesh&apos;s trusted agricultural marketplace — connecting
              farmers and buyers directly.
            </p>
            <p className="text-sm font-bengali text-muted-foreground mt-1">
              কৃষিহাট — বাংলাদেশের কৃষি মার্কেটপ্লেস
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/marketplace" className="hover:text-foreground transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/auctions" className="hover:text-foreground transition-colors">
                  Live Auctions
                </Link>
              </li>
              <li>
                <Link href="/market-prices" className="hover:text-foreground transition-colors">
                  Market Prices
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors">
                  Sign Up as Buyer
                </Link>
              </li>
              <li>
                <Link href="/buyer/orders" className="hover:text-foreground transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/buyer/cart" className="hover:text-foreground transition-colors">
                  My Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Sell on KrishiHat</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/signup?role=seller"
                  className="hover:text-foreground transition-colors"
                >
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/dashboard"
                  className="hover:text-foreground transition-colors"
                >
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/products/new"
                  className="hover:text-foreground transition-colors"
                >
                  Add Product
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/verification"
                  className="hover:text-foreground transition-colors"
                >
                  Get Verified
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} KrishiHat. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Made with ❤️ for Bangladesh farmers 🇧🇩
          </p>
        </div>
      </div>
    </footer>
  );
}