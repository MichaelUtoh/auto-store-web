export type ConversationStatus = "open" | "closed";
export type ContextType = "general" | "order" | "product";
export type SenderType = "customer" | "admin" | "system";

export interface Conversation {
  id: string;
  userId: string | null;
  guestId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  status: ConversationStatus;
  contextType: ContextType | null;
  contextId: string | null;
  lastMessageAt: string;
  unreadCount?: number;
  createdAt: string;
  /** Admin inbox: preview of last message body */
  lastMessagePreview?: string;
  /** Admin inbox: registered user display */
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  /** Precomputed display name from API when provided */
  customerDisplayName?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderUserId: string | null;
  body: string;
  createdAt: string;
}

export interface ChatContext {
  contextType: ContextType;
  contextId?: string;
  label?: string;
}

export interface GuestSession {
  guestToken: string;
  guestId: string;
}

export type ChatIdentity =
  | { kind: "user"; token: string }
  | { kind: "guest"; token: string; guestId: string };

export type WsClientFrame =
  | { type: "subscribe"; conversation_id: string }
  | { type: "unsubscribe"; conversation_id: string }
  | { type: "message"; conversation_id: string; body: string };

export type WsServerFrame =
  | { type: "message.new"; message: Record<string, unknown> }
  | { type: "conversation.updated"; conversation: Record<string, unknown> }
  | { type: "error"; message: string };
