"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotificationStore } from "@/store/useNotificationStore";

export default function NotificationsPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const isLoading = useNotificationStore((s) => s.isLoading);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-secondary">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "You're all caught up"}
        </p>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/notification-preferences">
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">All notifications</h2>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {isLoading && notifications.length === 0 ? (
            <p className="px-6 py-12 text-center text-secondary">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="px-6 py-12 text-center text-secondary">
              No notifications yet. Order updates and alerts will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li key={n.id} className="px-2 sm:px-4">
                  <NotificationItem notification={n} onRead={markAsRead} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
