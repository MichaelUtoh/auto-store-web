"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { openSupportChat } from "@/store/useSupportChatStore";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" },
  { href: "/cart", label: "Cart" },
  { href: "/account/orders", label: "Orders" },
];

export function MobileNav() {
  const isOpen = useUIStore((s) => s.isMobileMenuOpen);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-surface md:hidden"
      aria-modal="true"
      role="dialog"
      aria-label="Mobile menu"
    >
      <div className="flex flex-col gap-1 pt-20 px-4">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={closeMobileMenu}
            className={cn(
              "rounded-md px-4 py-3 text-base font-medium",
              pathname === href
                ? "bg-muted text-primary"
                : "text-secondary hover:bg-muted"
            )}
          >
            {label}
          </Link>
        ))}
        {!isAdmin && (
          <button
            type="button"
            onClick={() => {
              closeMobileMenu();
              openSupportChat({ contextType: "general" });
            }}
            className="rounded-md px-4 py-3 text-left text-base font-medium text-secondary hover:bg-muted"
          >
            Contact support
          </button>
        )}
      </div>
    </div>
  );
}
