import { apiClient } from "@/lib/api/client";
import { chatHttp, authHeaders } from "@/lib/chat/http";
import {
  mapChatMessageFromApi,
  mapConversationFromApi,
  mapConversationsListFromApi,
  mapGuestSessionFromApi,
  mapMessagesListFromApi,
  mapUnreadCountFromApi,
} from "@/lib/utils/mapSupportChatFromApi";
import type {
  ChatMessage,
  ContextType,
  Conversation,
} from "@/types/supportChat";

export const chatApi = {
  createGuestSession: async (): Promise<{ guestToken: string; guestId: string }> => {
    const { data } = await chatHttp.post("/chat/guest-session", {});
    return mapGuestSessionFromApi(data);
  },

  refreshGuestSession: async (guestToken: string): Promise<{ guestToken: string; guestId: string }> => {
    const { data } = await chatHttp.post(
      "/chat/guest-session/refresh",
      {},
      { headers: authHeaders(guestToken) }
    );
    return mapGuestSessionFromApi(data);
  },

  getMyConversation: async (token: string): Promise<Conversation | null> => {
    try {
      const { data } = await chatHttp.get("/conversations/me", {
        headers: authHeaders(token),
      });
      return mapConversationFromApi(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  createConversation: async (
    token: string,
    payload?: {
      contextType?: ContextType;
      contextId?: string;
      guestName?: string;
    }
  ): Promise<Conversation> => {
    const { data } = await chatHttp.post(
      "/conversations",
      {
        ...(payload?.contextType ? { context_type: payload.contextType } : {}),
        ...(payload?.contextId ? { context_id: payload.contextId } : {}),
        ...(payload?.guestName ? { guest_name: payload.guestName } : {}),
      },
      { headers: authHeaders(token) }
    );
    return mapConversationFromApi(data);
  },

  getMessages: async (
    token: string,
    conversationId: string,
    params?: { page?: number; limit?: number; since?: string }
  ): Promise<ChatMessage[]> => {
    const { data } = await chatHttp.get(`/conversations/${conversationId}/messages`, {
      headers: authHeaders(token),
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 50,
        ...(params?.since ? { since: params.since } : {}),
      },
    });
    return mapMessagesListFromApi(data);
  },

  sendMessage: async (
    token: string,
    conversationId: string,
    body: string
  ): Promise<ChatMessage> => {
    const { data } = await chatHttp.post(
      `/conversations/${conversationId}/messages`,
      { body },
      { headers: authHeaders(token) }
    );
    return mapChatMessageFromApi(data);
  },

  updateConversation: async (
    token: string,
    conversationId: string,
    payload: {
      status?: "open" | "closed";
      guestEmail?: string;
      guestName?: string;
    }
  ): Promise<Conversation> => {
    const { data } = await chatHttp.patch(
      `/conversations/${conversationId}`,
      {
        ...(payload.status ? { status: payload.status } : {}),
        ...(payload.guestEmail !== undefined ? { guest_email: payload.guestEmail } : {}),
        ...(payload.guestName !== undefined ? { guest_name: payload.guestName } : {}),
      },
      { headers: authHeaders(token) }
    );
    return mapConversationFromApi(data);
  },

  markRead: async (token: string, conversationId: string): Promise<void> => {
    await chatHttp.patch(`/conversations/${conversationId}/read`, {}, {
      headers: authHeaders(token),
    });
  },

  linkGuest: async (guestToken: string, accessToken: string): Promise<void> => {
    await chatHttp.post(
      "/conversations/link-guest",
      { guest_token: guestToken },
      { headers: authHeaders(accessToken) }
    );
  },

  // Admin endpoints (uses logged-in admin token via apiClient)
  adminListConversations: async (params?: {
    status?: "open" | "closed";
    page?: number;
    limit?: number;
    guestsOnly?: boolean;
    unreadOnly?: boolean;
  }): Promise<Conversation[]> => {
    const { data } = await apiClient.get("/admin/conversations", {
      params: {
        status: params?.status ?? "open",
        page: params?.page ?? 1,
        limit: params?.limit ?? 30,
        ...(params?.guestsOnly ? { guests_only: true } : {}),
        ...(params?.unreadOnly ? { unread_only: true } : {}),
      },
    });
    return mapConversationsListFromApi(data);
  },

  adminUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get("/admin/conversations/unread-count");
    return mapUnreadCountFromApi(data);
  },
};

export function getWsUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/ws/chat?token=${encodeURIComponent(token)}`;
}
