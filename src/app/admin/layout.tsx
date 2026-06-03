"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminSupportUnread } from "@/hooks/useAdminSupportUnread";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "Add product", icon: PlusCircle },
  { href: "/admin/support", label: "Support", icon: MessageSquare },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount: supportUnread } = useAdminSupportUnread();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user && user.role?.toLowerCase() !== "admin") {
      router.replace("/products");
    }
  }, [hasHydrated, isAuthenticated, user, pathname, router]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-secondary">Loading…</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-secondary">Redirecting to sign in…</p>
      </div>
    );
  }

  if (user && user.role?.toLowerCase() !== "admin") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-secondary">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r border-border bg-surface transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="font-semibold text-primary">Admin</span>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-1 p-4" aria-label="Admin">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href === "/admin/products" &&
                pathname.startsWith("/admin/products") &&
                pathname !== "/admin/products/new");
            const showSupportBadge = href === "/admin/support" && supportUnread > 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary hover:bg-muted hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{label}</span>
                {showSupportBadge && (
                  <span
                    className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                      isActive ? "bg-primary-foreground text-primary" : "bg-error text-white"
                    )}
                  >
                    {supportUnread > 99 ? "99+" : supportUnread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link
            href="/"
            className="text-sm text-secondary hover:text-primary"
          >
            ← Back to store
          </Link>
          {supportUnread > 0 && (
            <Link
              href="/admin/support"
              className="ml-auto flex items-center gap-2 rounded-pill bg-error/10 px-3 py-1 text-xs font-medium text-error"
            >
              {supportUnread} support {supportUnread === 1 ? "message" : "messages"}
            </Link>
          )}
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-overlay/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
