"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { NotificationItem } from "./NotificationItem";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);
  const isLoading = useNotificationStore((s) => s.isLoading);
  const isPanelOpen = useNotificationStore((s) => s.isPanelOpen);
  const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isPanelOpen) return;
    fetchNotifications();
  }, [isPanelOpen, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (isPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isPanelOpen, setPanelOpen]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setPanelOpen(!isPanelOpen)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isPanelOpen}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-border bg-surface shadow-float sm:w-80",
          isPanelOpen ? "block" : "hidden"
        )}
        role="dialog"
        aria-label="Notifications"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[min(60vh,20rem)] overflow-y-auto p-2">
          {isLoading && notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-secondary">
              Loading…
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-secondary">
              No notifications yet.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {notifications.map((n) => (
                <li key={n.id}>
                  <NotificationItem
                    notification={n}
                    onRead={markAsRead}
                    compact
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-2">
          <Link
            href="/account/notifications"
            onClick={() => setPanelOpen(false)}
            className="block rounded-2xl px-3 py-2.5 text-center text-sm font-medium text-foreground hover:bg-muted"
          >
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
