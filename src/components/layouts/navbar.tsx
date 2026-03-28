"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X, Sprout, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layouts/language-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/auctions", label: "Auctions" },
  { href: "/market-prices", label: "Market Prices" },
];

const dashboardMap: Record<string, string> = {
  buyer: "/buyer/dashboard",
  seller: "/seller/dashboard",
  moderator: "/moderator/dashboard",
  admin: "/admin/dashboard",
  super_admin: "/super-admin/dashboard",
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, profile, loading, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const dashboardPath = user ? (dashboardMap[user.role] || "/") : "/login";

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary flex-shrink-0">
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

            {/* Cart — only for buyers */}
            {user?.role === "buyer" && (
              <Link href="/buyer/cart">
                <Button variant="ghost" size="icon" aria-label="Cart">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Auth area */}
            {loading ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              /* Logged in — user dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="avatar"
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                    {profile?.fullName || user.email}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isDropdownOpen && "rotate-180")} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-background border rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium truncate">{profile?.fullName || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {user.role.replace("_", " ")}
                      </span>
                    </div>

                    <Link
                      href={dashboardPath}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    {user.role === "buyer" && (
                      <>
                        <Link href="/buyer/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                          My Orders
                        </Link>
                        <Link href="/buyer/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                          Profile
                        </Link>
                      </>
                    )}

                    {user.role === "seller" && (
                      <>
                        <Link href="/seller/products" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                          My Products
                        </Link>
                        <Link href="/seller/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                          My Orders
                        </Link>
                      </>
                    )}

                    <div className="border-t mt-1">
                      <button
                        onClick={() => { setIsDropdownOpen(false); logout(); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in */
              <>
                <Link href="/login" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/signup" className="hidden sm:inline-flex">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
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
            {user ? (
              <>
                <Link href={dashboardPath} className="block px-3 py-2 text-sm rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <button
                  onClick={() => { setIsMenuOpen(false); logout(); }}
                  className="block w-full text-left px-3 py-2 text-sm text-destructive rounded-md hover:bg-muted"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="block px-3 py-2 text-sm font-medium text-primary">
                Login / Sign Up
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}