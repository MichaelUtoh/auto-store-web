import { create } from "zustand";
import { notificationsApi } from "@/lib/api/notifications";
import type { Notification } from "@/types/notification";

interface NotificationStore {
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  isPanelOpen: boolean;
  lastFetchedAt: number | null;

  setPanelOpen: (open: boolean) => void;
  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: (opts?: { unreadOnly?: boolean }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  unreadCount: 0,
  notifications: [],
  isLoading: false,
  isPanelOpen: false,
  lastFetchedAt: null,

  setPanelOpen: (open) => set({ isPanelOpen: open }),

  fetchUnreadCount: async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      /* unauthenticated or network — keep previous count */
    }
  },

  fetchNotifications: async (opts) => {
    set({ isLoading: true });
    try {
      const list = await notificationsApi.list({
        limit: 20,
        unreadOnly: opts?.unreadOnly,
      });
      set({
        notifications: list,
        lastFetchedAt: Date.now(),
      });
      await get().fetchUnreadCount();
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    const wasUnread = get().notifications.some((n) => n.id === id && !n.read);
    await notificationsApi.markAsRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: wasUnread
        ? Math.max(0, s.unreadCount - 1)
        : s.unreadCount,
    }));
  },

  markAllAsRead: async () => {
    await notificationsApi.markAllAsRead();
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  reset: () =>
    set({
      unreadCount: 0,
      notifications: [],
      isLoading: false,
      isPanelOpen: false,
      lastFetchedAt: null,
    }),
}));
