"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  User,
  LogOut,
  UserCircle,
  Shield,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ProductSearch } from "@/components/product/ProductSearch";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAdminSupportUnread } from "@/hooks/useAdminSupportUnread";
import { cn } from "@/lib/utils";

export function Header() {
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
    window.location.href = `${baseUrl}`;
  };

  const firstName = user?.firstName;
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const { unreadCount: adminSupportUnread } = useAdminSupportUnread();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm">
      <div className="page-container flex h-16 items-center justify-between gap-3 sm:h-[4.5rem] md:gap-6">
        <div className="min-w-0 flex-1">
          <Link href="/" className="block">
            <p className="text-xs font-medium text-secondary sm:text-sm">
              {isAuthenticated && firstName ? "Hi!" : "Welcome"}
            </p>
            <p className="truncate text-lg font-bold tracking-tight text-primary sm:text-xl">
              {isAuthenticated && firstName ? firstName : "AutoParts"}
            </p>
          </Link>
        </div>

        <div className="hidden flex-1 max-w-md lg:block">
          <Suspense fallback={<div className="h-12 rounded-2xl bg-muted" />}>
            <ProductSearch basePath="/products" />
          </Suspense>
        </div>

        <div className="hidden items-center gap-1 md:flex lg:gap-2">
          <Navbar />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle compact className="shrink-0" />

          <NotificationBell />

          <Button variant="ghost" size="icon" asChild className="lg:hidden">
            <Link href="/search" aria-label="Search">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative hidden lg:flex"
            onClick={openCartDrawer}
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Admin"
              className="relative hidden md:flex"
            >
              <Link href="/admin/support">
                <Shield className="h-5 w-5" strokeWidth={1.5} />
                {adminSupportUnread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                    {adminSupportUnread > 9 ? "9+" : adminSupportUnread}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {isAuthenticated && user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-transparent transition-all hover:ring-primary/10 sm:h-11 sm:w-11"
                aria-label="Account menu"
                aria-expanded={accountOpen}
                aria-haspopup="true"
              >
                <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </button>
              <div
                className={cn(
                  "absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-2xl bg-surface py-1 shadow-float",
                  accountOpen ? "block" : "hidden"
                )}
              >
                <Link
                  href="/account/profile"
                  onClick={() => setAccountOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <UserCircle className="h-4 w-4" strokeWidth={1.5} />
                  View profile
                </Link>
                <Link
                  href="/account/notifications"
                  onClick={() => setAccountOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Bell className="h-4 w-4" strokeWidth={1.5} />
                  Notifications
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Button variant="default" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
