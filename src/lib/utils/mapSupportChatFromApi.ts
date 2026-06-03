import type { ChatMessage, Conversation } from "@/types/supportChat";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

function str(v: unknown): string {
  return v != null ? String(v) : "";
}

function num(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function mapEmbeddedUserFields(obj: Record<string, unknown>): {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  customerDisplayName: string;
} {
  const embedded = obj.user ?? obj.customer ?? obj.participant;
  if (embedded && typeof embedded === "object") {
    const u = embedded as Record<string, unknown>;
    const first = str(u.first_name ?? u.firstName);
    const last = str(u.last_name ?? u.lastName);
    const email = str(u.email);
    const full = `${first} ${last}`.trim();
    return {
      userFirstName: first,
      userLastName: last,
      userEmail: email,
      customerDisplayName: full || str(u.name ?? u.display_name ?? u.displayName) || email,
    };
  }

  const first = str(obj.user_first_name ?? obj.userFirstName);
  const last = str(obj.user_last_name ?? obj.userLastName);
  const email = str(obj.user_email ?? obj.userEmail);
  const explicit = str(
    obj.display_name ??
      obj.displayName ??
      obj.customer_name ??
      obj.customerName ??
      obj.customer_display_name
  );

  return {
    userFirstName: first,
    userLastName: last,
    userEmail: email,
    customerDisplayName: explicit || `${first} ${last}`.trim() || email,
  };
}

export function mapConversationFromApi(raw: unknown): Conversation {
  const r = unwrapApiDataBody(raw) as Record<string, unknown>;
  const obj = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
  const userFields = mapEmbeddedUserFields(obj);

  return {
    id: str(obj.id),
    userId: obj.user_id != null ? str(obj.user_id) : obj.userId != null ? str(obj.userId) : null,
    guestId: obj.guest_id != null ? str(obj.guest_id) : obj.guestId != null ? str(obj.guestId) : null,
    guestEmail: obj.guest_email != null ? str(obj.guest_email) : obj.guestEmail != null ? str(obj.guestEmail) : null,
    guestName: obj.guest_name != null ? str(obj.guest_name) : obj.guestName != null ? str(obj.guestName) : null,
    status: (obj.status as Conversation["status"]) ?? "open",
    contextType: (obj.context_type ?? obj.contextType) as Conversation["contextType"],
    contextId: obj.context_id != null ? str(obj.context_id) : obj.contextId != null ? str(obj.contextId) : null,
    lastMessageAt: str(obj.last_message_at ?? obj.lastMessageAt ?? obj.created_at ?? obj.createdAt),
    unreadCount: num(obj.unread_count ?? obj.unreadCount),
    createdAt: str(obj.created_at ?? obj.createdAt),
    lastMessagePreview: str(obj.last_message_preview ?? obj.lastMessagePreview ?? obj.last_message_body ?? ""),
    ...userFields,
  };
}

export function mapChatMessageFromApi(raw: unknown): ChatMessage {
  const r = unwrapApiDataBody(raw) as Record<string, unknown>;
  const obj = (r && typeof r === "object" ? r : raw) as Record<string, unknown>;
  return {
    id: str(obj.id),
    conversationId: str(obj.conversation_id ?? obj.conversationId),
    senderType: (obj.sender_type ?? obj.senderType ?? "customer") as ChatMessage["senderType"],
    senderUserId: obj.sender_user_id != null ? str(obj.sender_user_id) : obj.senderUserId != null ? str(obj.senderUserId) : null,
    body: str(obj.body),
    createdAt: str(obj.created_at ?? obj.createdAt),
  };
}

export function mapConversationsListFromApi(body: unknown): Conversation[] {
  const unwrapped = unwrapApiDataBody(body);
  if (Array.isArray(unwrapped)) {
    return unwrapped.map(mapConversationFromApi);
  }
  if (unwrapped && typeof unwrapped === "object") {
    const list = (unwrapped as Record<string, unknown>).data;
    if (Array.isArray(list)) return list.map(mapConversationFromApi);
    if (Array.isArray((unwrapped as Record<string, unknown>).items)) {
      return ((unwrapped as Record<string, unknown>).items as unknown[]).map(mapConversationFromApi);
    }
  }
  return [];
}

export function mapMessagesListFromApi(body: unknown): ChatMessage[] {
  const unwrapped = unwrapApiDataBody(body);
  if (Array.isArray(unwrapped)) {
    return unwrapped.map(mapChatMessageFromApi);
  }
  if (unwrapped && typeof unwrapped === "object") {
    const list = (unwrapped as Record<string, unknown>).data;
    if (Array.isArray(list)) return list.map(mapChatMessageFromApi);
  }
  return [];
}

export function mapGuestSessionFromApi(body: unknown): { guestToken: string; guestId: string } {
  const obj = unwrapApiDataBody(body) as Record<string, unknown>;
  return {
    guestToken: str(obj.guest_token ?? obj.guestToken),
    guestId: str(obj.guest_id ?? obj.guestId),
  };
}

export function mapUnreadCountFromApi(body: unknown): number {
  const obj = unwrapApiDataBody(body) as Record<string, unknown>;
  const count = obj.count ?? obj.unread_count ?? obj.unreadCount ?? obj.total;
  const n = Number(count);
  return Number.isFinite(n) ? n : 0;
}
