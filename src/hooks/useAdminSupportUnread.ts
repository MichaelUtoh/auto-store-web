"use client";

import { useCallback, useEffect, useState } from "react";
import { chatApi } from "@/lib/chat/api";
import { useAuthStore } from "@/store/useAuthStore";

export function useAdminSupportUnread(pollMs = 60_000) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const refresh = useCallback(async () => {
    if (!isAdmin || !isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await chatApi.adminUnreadCount();
      setUnreadCount(count);
    } catch {
      // silent
    }
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    if (!hasHydrated || !isAdmin) return;
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [hasHydrated, isAdmin, refresh, pollMs]);

  return { unreadCount, refresh };
}
