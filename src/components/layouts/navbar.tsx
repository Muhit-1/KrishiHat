"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X, Sprout } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layouts/language-toggle";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/auctions", label: "Auctions" },
  { href: "/market-prices", label: "Market Prices" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Sprout className="h-6 w-6" />
            <span>KrishiHat</span>
            <span className="text-sm font-normal text-muted-foreground hidden sm:inline">কৃষিহাট</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/buyer/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="hidden sm:inline-flex">
              <Button size="sm">Login</Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm rounded-md hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="block px-3 py-2 text-sm font-medium text-primary">
              Login / Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}