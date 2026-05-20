"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

const navItems = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/search") },
  {
    href: "/categories",
    label: "Browse",
    icon: LayoutGrid,
    match: (p: string) => p.startsWith("/categories") || p.startsWith("/products"),
  },
  {
    href: "/cart",
    label: "Cart",
    icon: ShoppingBag,
    match: (p: string) => p === "/cart",
    isCart: true,
  },
  {
    href: "/account/profile",
    label: "Account",
    icon: User,
    match: (p: string) => p.startsWith("/account") || p.startsWith("/login"),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-50 lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-md items-center justify-around rounded-pill bg-primary px-2 py-2 shadow-float">
        {navItems.map(({ href, label, icon: Icon, match, isCart }) => {
          const active = match(pathname);
          const accountHref = isAuthenticated ? href : "/login";

          if (isCart) {
            return (
              <button
                key={label}
                type="button"
                onClick={openCartDrawer}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 rounded-pill px-3 py-2 text-[10px] font-medium transition-colors",
                  active
                    ? "text-primary-foreground"
                    : "text-primary-foreground/60 hover:text-primary-foreground"
                )}
                aria-label={`${label}${totalItems > 0 ? `, ${totalItems} items` : ""}`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span>{label}</span>
                {totalItems > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[9px] font-bold text-primary">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={label}
              href={href === "/account/profile" ? accountHref : href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-pill px-3 py-2 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary-foreground"
                  : "text-primary-foreground/60 hover:text-primary-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
