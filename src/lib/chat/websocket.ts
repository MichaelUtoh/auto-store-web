import { getWsUrl } from "@/lib/chat/api";
import type { WsClientFrame, WsServerFrame } from "@/types/supportChat";
import {
  mapChatMessageFromApi,
  mapConversationFromApi,
} from "@/lib/utils/mapSupportChatFromApi";
import type { ChatMessage, Conversation } from "@/types/supportChat";

export type ChatWsHandlers = {
  onMessage?: (message: ChatMessage) => void;
  onConversationUpdated?: (conversation: Conversation) => void;
  onConnect?: () => void;
  /** Fired on subsequent successful connections after the first. */
  onReconnect?: () => void;
  onDisconnect?: () => void;
  onReconnecting?: () => void;
  onError?: (message: string) => void;
};

const MAX_BACKOFF_MS = 30_000;

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private conversationId: string | null = null;
  private handlers: ChatWsHandlers;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  private connectCount = 0;

  constructor(token: string, handlers: ChatWsHandlers) {
    this.token = token;
    this.handlers = handlers;
  }

  connect(conversationId: string) {
    this.conversationId = conversationId;
    this.intentionalClose = false;
    this.openSocket();
  }

  updateToken(token: string) {
    this.token = token;
    if (this.conversationId && this.ws?.readyState === WebSocket.OPEN) {
      this.reconnect();
    }
  }

  private openSocket() {
    if (typeof window === "undefined") return;
    this.cleanupSocket();

    const url = getWsUrl(this.token);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.connectCount += 1;
      if (this.connectCount > 1) {
        this.handlers.onReconnect?.();
      } else {
        this.handlers.onConnect?.();
      }
      if (this.conversationId) {
        this.send({ type: "subscribe", conversation_id: this.conversationId });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data as string) as WsServerFrame;
        if (frame.type === "message.new" && frame.message) {
          this.handlers.onMessage?.(mapChatMessageFromApi(frame.message));
        } else if (frame.type === "conversation.updated" && frame.conversation) {
          this.handlers.onConversationUpdated?.(
            mapConversationFromApi(frame.conversation)
          );
        } else if (frame.type === "error") {
          this.handlers.onError?.(frame.message);
        }
      } catch {
        // ignore malformed frames
      }
    };

    this.ws.onclose = () => {
      this.handlers.onDisconnect?.();
      if (!this.intentionalClose && this.conversationId) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.handlers.onError?.("WebSocket connection error");
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.handlers.onReconnecting?.();
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, MAX_BACKOFF_MS);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, delay);
  }

  reconnect() {
    this.intentionalClose = false;
    this.reconnectAttempt = 0;
    this.openSocket();
  }

  send(frame: WsClientFrame) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(frame));
    }
  }

  sendMessage(body: string) {
    if (!this.conversationId) return false;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        type: "message",
        conversation_id: this.conversationId,
        body,
      });
      return true;
    }
    return false;
  }

  unsubscribe() {
    if (this.conversationId && this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: "unsubscribe", conversation_id: this.conversationId });
    }
  }

  close() {
    this.intentionalClose = true;
    this.unsubscribe();
    this.cleanupSocket();
    this.conversationId = null;
    this.connectCount = 0;
  }

  private cleanupSocket() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
