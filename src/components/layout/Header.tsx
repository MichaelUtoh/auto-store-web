"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, Search, User, LogOut, UserCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ProductSearch } from "@/components/product/ProductSearch";
import { cn } from "@/lib/utils";

export function Header() {
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [accountOpen]);

  const handleSignOut = () => {
    setAccountOpen(false);
    logout();
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    window.location.href = `${baseUrl}/login`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-surface">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="text-xl font-semibold text-primary">
          AutoParts
        </Link>

        <div className="hidden flex-1 max-w-xl md:block">
          <ProductSearch />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="md:hidden">
            <Link href="/search" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCartDrawer}
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Button>

          {user?.role?.toLowerCase() === "admin" && (
            <Button variant="ghost" size="icon" asChild aria-label="Admin">
              <Link href="/admin">
                <Shield className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {isAuthenticated && user ? (
            <div className="relative" ref={accountRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAccountOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={accountOpen}
                aria-haspopup="true"
              >
                <User className="h-5 w-5" />
              </Button>
              <div
                className={cn(
                  "absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-md border border-gray-200 bg-surface py-1 shadow-md",
                  accountOpen ? "block" : "hidden"
                )}
              >
                <Link
                  href="/account/profile"
                  onClick={() => setAccountOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-muted"
                >
                  <UserCircle className="h-4 w-4" />
                  View profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
