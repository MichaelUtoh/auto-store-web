"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/q", label: "Q&A" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
            pathname === href || pathname.startsWith(`${href}/`)
              ? "bg-muted text-primary"
              : "text-secondary hover:bg-muted hover:text-primary"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
