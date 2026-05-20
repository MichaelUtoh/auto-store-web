"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const nav = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      const redirect = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirect);
    }
  }, [hasHydrated, isAuthenticated, pathname, router]);

  if (!hasHydrated) {
    return (
      <div className="page-container flex min-h-[40vh] items-center justify-center">
        <p className="text-secondary">Loading…</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="page-container flex min-h-[40vh] items-center justify-center">
        <p className="text-secondary">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <div className="page-container py-6 sm:py-8">
      <h1 className="page-title">Account</h1>
      <nav
        className="scrollbar-hide -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:-mx-0 sm:px-0"
        aria-label="Account"
      >
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "shrink-0 rounded-pill px-4 py-2.5 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-secondary hover:text-primary"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 sm:mt-8">{children}</div>
    </div>
  );
}
