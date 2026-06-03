"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSupportChatStore } from "@/store/useSupportChatStore";
import { chatApi } from "@/lib/chat/api";
import { ChatWebSocket } from "@/lib/chat/websocket";
import {
  ensureChatIdentity,
  getStoredGuestDisplayName,
  resetGuestSession,
  storeGuestDisplayName,
} from "@/lib/chat/identity";
import { conversationMatchesContext } from "@/lib/chat/contextDisplay";
import {
  getChatErrorMessage,
  getHttpStatus,
  refreshUserChatToken,
} from "@/lib/chat/errors";
import {
  lastMessageTimestamp,
  mergeChatMessages,
} from "@/lib/chat/syncMessages";
import type { ChatMessage, ChatContext } from "@/types/supportChat";

interface SupportChatContextValue {
  sendMessage: (body: string) => Promise<void>;
  closeConversation: () => Promise<void>;
  saveGuestEmail: (email: string, name?: string) => Promise<void>;
  refreshUnread: () => Promise<void>;
  continueCurrentContext: () => void;
  startNewContextConversation: () => Promise<void>;
}

const SupportChatContext = createContext<SupportChatContextValue | null>(null);

export function useSupportChat() {
  const ctx = useContext(SupportChatContext);
  if (!ctx) throw new Error("useSupportChat must be used within SupportChatProvider");
  return ctx;
}

export function SupportChatProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const isOpen = useSupportChatStore((s) => s.isOpen);
  const wsConnected = useSupportChatStore((s) => s.wsConnected);
  const conversation = useSupportChatStore((s) => s.conversation);
  const pendingContext = useSupportChatStore((s) => s.pendingContext);
  const setConversation = useSupportChatStore((s) => s.setConversation);
  const setMessages = useSupportChatStore((s) => s.setMessages);
  const appendMessage = useSupportChatStore((s) => s.appendMessage);
  const setUnreadCount = useSupportChatStore((s) => s.setUnreadCount);
  const setLoading = useSupportChatStore((s) => s.setLoading);
  const setSending = useSupportChatStore((s) => s.setSending);
  const setReconnecting = useSupportChatStore((s) => s.setReconnecting);
  const setWsConnected = useSupportChatStore((s) => s.setWsConnected);
  const incrementGuestMessagesSent = useSupportChatStore((s) => s.incrementGuestMessagesSent);
  const setShowAdminReplyPrompt = useSupportChatStore((s) => s.setShowAdminReplyPrompt);
  const clearPendingContext = useSupportChatStore((s) => s.clearPendingContext);
  const resetThread = useSupportChatStore((s) => s.resetThread);
  const setChatError = useSupportChatStore((s) => s.setChatError);
  const setContextSwitchRequest = useSupportChatStore((s) => s.setContextSwitchRequest);

  const wsRef = useRef<ChatWebSocket | null>(null);
  const tokenRef = useRef<string>("");
  const identityKindRef = useRef<"user" | "guest">("guest");
  const initRetryRef = useRef(false);

  const handleIncomingMessage = useCallback(
    (message: ChatMessage) => {
      appendMessage(message);
      if (
        message.senderType === "admin" &&
        identityKindRef.current === "guest" &&
        !useSupportChatStore.getState().conversation?.guestEmail
      ) {
        setShowAdminReplyPrompt(true);
      }
    },
    [appendMessage, setShowAdminReplyPrompt]
  );

  const syncMessagesSinceLast = useCallback(async () => {
    const conv = useSupportChatStore.getState().conversation;
    if (!conv || !tokenRef.current) return;
    const existing = useSupportChatStore.getState().messages;
    const since = lastMessageTimestamp(existing);
    try {
      const incoming = await chatApi.getMessages(tokenRef.current, conv.id, {
        since,
        limit: 100,
      });
      const merged = mergeChatMessages(existing, incoming);
      if (merged.length !== existing.length) {
        setMessages(merged);
        incoming.forEach((msg) => {
          if (
            msg.senderType === "admin" &&
            identityKindRef.current === "guest" &&
            !useSupportChatStore.getState().conversation?.guestEmail
          ) {
            setShowAdminReplyPrompt(true);
          }
        });
      }
    } catch {
      // silent during background sync
    }
  }, [setMessages, setShowAdminReplyPrompt]);

  const connectWebSocket = useCallback(
    (token: string, conversationId: string) => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      wsRef.current = new ChatWebSocket(token, {
        onConnect: () => {
          setWsConnected(true);
          setReconnecting(false);
        },
        onReconnect: () => {
          setWsConnected(true);
          setReconnecting(false);
          void syncMessagesSinceLast();
        },
        onDisconnect: () => setWsConnected(false),
        onReconnecting: () => setReconnecting(true),
        onMessage: (msg) => {
          setReconnecting(false);
          handleIncomingMessage(msg);
        },
        onError: () => setReconnecting(false),
      });
      wsRef.current.connect(conversationId);
    },
    [handleIncomingMessage, setWsConnected, setReconnecting, syncMessagesSinceLast]
  );

  const handleAuthFailure = useCallback(async (): Promise<boolean> => {
    if (identityKindRef.current === "guest") {
      const session = await resetGuestSession();
      tokenRef.current = session.token;
      identityKindRef.current = "guest";
      return true;
    }
    const newToken = await refreshUserChatToken();
    if (newToken) {
      tokenRef.current = newToken;
      identityKindRef.current = "user";
      return true;
    }
    setChatError("Session expired. Please sign in again.");
    return false;
  }, [setChatError]);

  const initThread = useCallback(async () => {
    if (!hasHydrated) return;
    setLoading(true);
    setChatError(null);
    initRetryRef.current = false;

    const loadConversation = async (
      identity: Awaited<ReturnType<typeof ensureChatIdentity>>,
      conv: NonNullable<Awaited<ReturnType<typeof chatApi.getMyConversation>>>
    ) => {
      setConversation(conv);
      const msgs = await chatApi.getMessages(identity.token, conv.id, { limit: 100 });
      setMessages(msgs);
      setUnreadCount(conv.unreadCount ?? 0);

      const guestSent = msgs.filter((m) => m.senderType === "customer").length;
      useSupportChatStore.setState({ guestMessagesSent: guestSent });

      connectWebSocket(identity.token, conv.id);

      if (conv.unreadCount && conv.unreadCount > 0) {
        chatApi.markRead(identity.token, conv.id).catch(() => {});
        setUnreadCount(0);
      }
    };

    const run = async () => {
      const identity = await ensureChatIdentity(user, accessToken);
      tokenRef.current = identity.token;
      identityKindRef.current = identity.kind;

      let conv = await chatApi.getMyConversation(identity.token);
      if (conv?.status === "closed") {
        conv = null;
      }

      const ctx = useSupportChatStore.getState().pendingContext;
      if (conv && ctx && !conversationMatchesContext(conv, ctx)) {
        setContextSwitchRequest(ctx);
        await loadConversation(identity, conv);
        return;
      }

      if (!conv) {
        const guestName =
          identity.kind === "guest" ? getStoredGuestDisplayName() : undefined;
        conv = await chatApi.createConversation(identity.token, {
          contextType: ctx?.contextType ?? "general",
          contextId: ctx?.contextId,
          guestName,
        });
        clearPendingContext();
        setContextSwitchRequest(null);
        if (ctx?.label) {
          useSupportChatStore.setState({ activeContextLabel: ctx.label });
        }
      } else {
        clearPendingContext();
        setContextSwitchRequest(null);
      }

      await loadConversation(identity, conv);
    };

    try {
      await run();
    } catch (err: unknown) {
      const status = getHttpStatus(err);
      if (status === 401 && !initRetryRef.current) {
        initRetryRef.current = true;
        const recovered = await handleAuthFailure();
        if (recovered) {
          try {
            await run();
            return;
          } catch (retryErr) {
            setChatError(getChatErrorMessage(retryErr));
          }
        }
      } else {
        setChatError(getChatErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [
    hasHydrated,
    user,
    accessToken,
    setConversation,
    setMessages,
    setUnreadCount,
    setLoading,
    setChatError,
    clearPendingContext,
    connectWebSocket,
    handleAuthFailure,
    setContextSwitchRequest,
  ]);

  useEffect(() => {
    if (isOpen) {
      initThread();
    } else if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setWsConnected(false);
      setReconnecting(false);
    }
    return () => {
      if (!isOpen && wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen, initThread, setWsConnected, setReconnecting]);

  useEffect(() => {
    if (!hasHydrated || isOpen) return;

    const poll = async () => {
      try {
        const identity = await ensureChatIdentity(user, accessToken);
        const conv = await chatApi.getMyConversation(identity.token);
        setUnreadCount(conv?.unreadCount ?? 0);
      } catch {
        // silent
      }
    };

    poll();
    const id = setInterval(poll, 60_000);
    return () => clearInterval(id);
  }, [hasHydrated, isOpen, user, accessToken, setUnreadCount]);

  useEffect(() => {
    if (!isOpen || wsConnected || !conversation) return;
    const poll = () => void syncMessagesSinceLast();
    poll();
    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, [isOpen, wsConnected, conversation, syncMessagesSinceLast]);

  const sendMessage = useCallback(
    async (body: string) => {
      const conv = useSupportChatStore.getState().conversation;
      if (!conv || !body.trim()) return;
      setSending(true);
      setChatError(null);
      const trimmed = body.trim();

      const sendViaRest = async () => {
        const msg = await chatApi.sendMessage(tokenRef.current, conv.id, trimmed);
        appendMessage(msg);
      };

      try {
        const ws = wsRef.current;
        if (ws?.isConnected()) {
          ws.sendMessage(trimmed);
          if (identityKindRef.current === "guest") {
            incrementGuestMessagesSent();
          }
          return;
        }
        await sendViaRest();
        if (identityKindRef.current === "guest") {
          incrementGuestMessagesSent();
        }
      } catch (err: unknown) {
        const status = getHttpStatus(err);
        if (status === 401) {
          const recovered = await handleAuthFailure();
          if (recovered) {
            try {
              await sendViaRest();
              if (identityKindRef.current === "guest") {
                incrementGuestMessagesSent();
              }
              return;
            } catch (retryErr) {
              setChatError(getChatErrorMessage(retryErr));
              throw retryErr;
            }
          }
        }
        if (wsRef.current?.isConnected()) {
          try {
            await sendViaRest();
            if (identityKindRef.current === "guest") {
              incrementGuestMessagesSent();
            }
            return;
          } catch {
            // fall through
          }
        }
        setChatError(getChatErrorMessage(err));
        throw err;
      } finally {
        setSending(false);
      }
    },
    [
      appendMessage,
      incrementGuestMessagesSent,
      setSending,
      setChatError,
      handleAuthFailure,
    ]
  );

  const closeConversation = useCallback(async () => {
    const conv = useSupportChatStore.getState().conversation;
    if (!conv) return;
    try {
      await chatApi.updateConversation(tokenRef.current, conv.id, { status: "closed" });
      wsRef.current?.close();
      wsRef.current = null;
      resetThread();
    } catch (err) {
      setChatError(getChatErrorMessage(err));
      throw err;
    }
  }, [resetThread, setChatError]);

  const saveGuestEmail = useCallback(
    async (email: string, name?: string) => {
      const conv = useSupportChatStore.getState().conversation;
      if (!conv) return;
      if (name?.trim()) {
        storeGuestDisplayName(name);
      }
      try {
        const updated = await chatApi.updateConversation(tokenRef.current, conv.id, {
          guestEmail: email,
          guestName: name,
        });
        setConversation(updated);
        setShowAdminReplyPrompt(false);
      } catch (err) {
        setChatError(getChatErrorMessage(err));
        throw err;
      }
    },
    [setConversation, setShowAdminReplyPrompt, setChatError]
  );

  const continueCurrentContext = useCallback(() => {
    setContextSwitchRequest(null);
    clearPendingContext();
    useSupportChatStore.setState({ activeContextLabel: null });
  }, [setContextSwitchRequest, clearPendingContext]);

  const startNewContextConversation = useCallback(async () => {
    const ctx =
      useSupportChatStore.getState().contextSwitchRequest ??
      useSupportChatStore.getState().pendingContext;
    const conv = useSupportChatStore.getState().conversation;
    if (!ctx) return;

    setLoading(true);
    setChatError(null);
    try {
      if (conv) {
        await chatApi.updateConversation(tokenRef.current, conv.id, { status: "closed" });
      }
      wsRef.current?.close();
      wsRef.current = null;
      resetThread();

      const identity = await ensureChatIdentity(user, accessToken);
      tokenRef.current = identity.token;
      identityKindRef.current = identity.kind;

      const guestName =
        identity.kind === "guest"
          ? getStoredGuestDisplayName()
          : undefined;

      const newConv = await chatApi.createConversation(identity.token, {
        contextType: ctx.contextType ?? "general",
        contextId: ctx.contextId,
        guestName,
      });

      clearPendingContext();
      setContextSwitchRequest(null);
      useSupportChatStore.setState({
        activeContextLabel: ctx.label ?? null,
      });

      setConversation(newConv);
      const msgs = await chatApi.getMessages(identity.token, newConv.id, { limit: 100 });
      setMessages(msgs);
      useSupportChatStore.setState({
        guestMessagesSent: msgs.filter((m) => m.senderType === "customer").length,
      });
      connectWebSocket(identity.token, newConv.id);
    } catch (err) {
      setChatError(getChatErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    user,
    accessToken,
    resetThread,
    setLoading,
    setChatError,
    setConversation,
    setMessages,
    clearPendingContext,
    setContextSwitchRequest,
    connectWebSocket,
  ]);

  const refreshUnread = useCallback(async () => {
    try {
      const identity = await ensureChatIdentity(user, accessToken);
      const conv = await chatApi.getMyConversation(identity.token);
      setUnreadCount(conv?.unreadCount ?? 0);
    } catch {
      // silent
    }
  }, [user, accessToken, setUnreadCount]);

  useEffect(() => {
    if (!isOpen || !accessToken || !wsRef.current) return;
    tokenRef.current = accessToken;
    identityKindRef.current = "user";
    wsRef.current.updateToken(accessToken);
  }, [accessToken, isOpen]);

  const value: SupportChatContextValue = {
    sendMessage,
    closeConversation,
    saveGuestEmail,
    refreshUnread,
    continueCurrentContext,
    startNewContextConversation,
  };

  return (
    <SupportChatContext.Provider value={value}>{children}</SupportChatContext.Provider>
  );
}

export type { ChatContext };
