"use client";

import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";

const POLL_INTERVAL_MS = 60_000;

/** Keeps unread count in sync when the user is signed in. */
export function useNotificationPolling(enabled = true) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const reset = useNotificationStore((s) => s.reset);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      reset();
      return;
    }
    if (!enabled) return;

    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasHydrated, isAuthenticated, enabled, fetchUnreadCount, reset]);
}

export function useNotifications() {
  const store = useNotificationStore();

  const refresh = useCallback(async () => {
    await store.fetchNotifications();
  }, [store]);

  return { ...store, refresh };
}
