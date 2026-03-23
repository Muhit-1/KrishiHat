"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  links: SidebarLink[];
  title?: string;
}

export function Sidebar({ links, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] border-r bg-muted/20 p-4">
      {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-2">{title}</h2>}
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === link.href || pathname.startsWith(link.href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}