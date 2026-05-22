"use client";

import { useNotificationPolling } from "@/hooks/useNotifications";

export function NotificationPolling() {
  useNotificationPolling();
  return null;
}
