"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";
import type { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onRead,
  compact = false,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read && onRead) {
      onRead(notification.id);
    }
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-sm leading-snug",
            notification.read
              ? "font-medium text-secondary"
              : "font-semibold text-foreground"
          )}
        >
          {notification.title}
        </p>
        {!notification.read && (
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
            aria-hidden
          />
        )}
      </div>
      {notification.message && (
        <p
          className={cn(
            "mt-1 text-secondary",
            compact ? "line-clamp-2 text-xs" : "text-sm"
          )}
        >
          {notification.message}
        </p>
      )}
      <p className="mt-1.5 text-xs text-secondary">
        {formatDateTime(notification.createdAt)}
      </p>
    </>
  );

  const className = cn(
    "block w-full rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted",
    !notification.read && "bg-muted/60"
  );

  if (notification.actionUrl) {
    return (
      <Link
        href={notification.actionUrl}
        className={className}
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {content}
    </button>
  );
}
