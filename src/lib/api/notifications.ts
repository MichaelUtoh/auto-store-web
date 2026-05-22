import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Notification,
  NotificationPreferences,
  NotificationPreferencesUpdate,
} from "@/types/notification";
import {
  mapNotificationFromApi,
  mapNotificationsListFromApi,
  mapNotificationPreferencesFromApi,
  mapUnreadCountFromApi,
  notificationPreferencesToApi,
} from "@/lib/utils/mapNotificationFromApi";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationsApi = {
  list: async (
    params: ListNotificationsParams = {}
  ): Promise<Notification[]> => {
    const { page = 1, limit = 20, unreadOnly } = params;
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<unknown> | unknown[]>
    >("/notifications", {
      params: {
        page,
        limit,
        ...(unreadOnly !== undefined ? { unread_only: unreadOnly } : {}),
      },
    });
    return mapNotificationsListFromApi(data);
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(
      "/notifications/unread-count"
    );
    return mapUnreadCountFromApi(data);
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const { data } = await apiClient.patch<ApiResponse<unknown>>(
      `/notifications/${id}/read`
    );
    const raw = unwrapApiDataBody(data);
    if (raw && typeof raw === "object" && "id" in raw) {
      return mapNotificationFromApi(raw);
    }
    return mapNotificationFromApi({ id, read: true });
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all");
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(
      "/users/me/notification-preferences"
    );
    return mapNotificationPreferencesFromApi(data);
  },

  updatePreferences: async (
    payload: NotificationPreferencesUpdate
  ): Promise<NotificationPreferences> => {
    const { data } = await apiClient.put<ApiResponse<unknown>>(
      "/users/me/notification-preferences",
      notificationPreferencesToApi(payload)
    );
    return mapNotificationPreferencesFromApi(data);
  },
};
