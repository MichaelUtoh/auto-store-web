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
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-secondary">Loading…</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-secondary">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">Account</h1>
      <nav className="mt-6 flex gap-4 border-b border-gray-200" aria-label="Account">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "border-b-2 px-1 py-3 text-sm font-medium transition-colors",
              pathname === href
                ? "border-accent text-accent"
                : "border-transparent text-secondary hover:text-primary"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
