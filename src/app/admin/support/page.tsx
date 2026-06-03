"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chatApi } from "@/lib/chat/api";
import { ChatWebSocket } from "@/lib/chat/websocket";
import { mergeChatMessages, lastMessageTimestamp } from "@/lib/chat/syncMessages";
import { adminContextLink, conversationDisplayName } from "@/lib/chat/contextDisplay";
import { mapConversationFromApi } from "@/lib/utils/mapSupportChatFromApi";
import { getChatErrorMessage, getHttpStatus } from "@/lib/chat/errors";
import { useAdminSupportUnread } from "@/hooks/useAdminSupportUnread";
import { useAuthStore } from "@/store/useAuthStore";
import { MessageList } from "@/components/support/MessageList";
import { MessageComposer } from "@/components/support/MessageComposer";
import type { ChatMessage, Conversation } from "@/types/supportChat";

type Filter = "all" | "guests" | "unread";

function emailSnippet(c: Conversation): string {
  return c.userEmail ?? c.guestEmail ?? "";
}

export default function AdminSupportPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [threadError, setThreadError] = useState<string | null>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const { refresh: refreshGlobalUnread } = useAdminSupportUnread(60_000);

  messagesRef.current = messages;

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const loadInbox = useCallback(async () => {
    setLoadingList(true);
    try {
      const [list, count] = await Promise.all([
        chatApi.adminListConversations({
          status: "open",
          guestsOnly: filter === "guests",
          unreadOnly: filter === "unread",
        }),
        chatApi.adminUnreadCount(),
      ]);
      setConversations(list);
      setUnreadTotal(count);
    } finally {
      setLoadingList(false);
    }
  }, [filter]);

  useEffect(() => {
    loadInbox();
    const id = setInterval(loadInbox, 60_000);
    return () => clearInterval(id);
  }, [loadInbox]);

  const syncThread = useCallback(
    async (conversationId: string) => {
      if (!accessToken) return;
      const since = lastMessageTimestamp(messagesRef.current);
      const incoming = await chatApi.getMessages(accessToken, conversationId, {
        since,
        limit: 100,
      });
      setMessages((prev) => mergeChatMessages(prev, incoming));
    },
    [accessToken]
  );

  const loadThread = useCallback(
    async (conversationId: string) => {
      if (!accessToken) return;
      setLoadingThread(true);
      try {
        const msgs = await chatApi.getMessages(accessToken, conversationId, { limit: 100 });
        setMessages(msgs);
        await chatApi.markRead(accessToken, conversationId);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        );
        void refreshGlobalUnread();
      } finally {
        setLoadingThread(false);
      }
    },
    [accessToken, refreshGlobalUnread]
  );

  useEffect(() => {
    if (!selectedId || !accessToken) return;

    loadThread(selectedId);

    wsRef.current?.close();
    wsRef.current = new ChatWebSocket(accessToken, {
      onMessage: (msg) => {
        setMessages((prev) => mergeChatMessages(prev, [msg]));
        if (msg.senderType === "customer") {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId
                ? {
                    ...c,
                    lastMessagePreview: msg.body,
                    lastMessageAt: msg.createdAt,
                    unreadCount: (c.unreadCount ?? 0) + 1,
                  }
                : c
            )
          );
          void refreshGlobalUnread();
        }
      },
      onReconnect: () => {
        void syncThread(selectedId);
      },
      onConversationUpdated: (updated) => {
        setConversations((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
        );
      },
    });
    wsRef.current.connect(selectedId);

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [selectedId, accessToken, loadThread, syncThread, refreshGlobalUnread]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleSend = async (body: string) => {
    if (!selectedId || !accessToken) return;
    setSending(true);
    setThreadError(null);
    try {
      if (wsRef.current?.isConnected()) {
        wsRef.current.sendMessage(body);
      } else {
        const msg = await chatApi.sendMessage(accessToken, selectedId, body);
        setMessages((prev) => mergeChatMessages(prev, [msg]));
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, lastMessagePreview: body, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      if (getHttpStatus(err) === 403) {
        setThreadError(getChatErrorMessage(err));
      } else if (wsRef.current?.isConnected()) {
        try {
          const msg = await chatApi.sendMessage(accessToken, selectedId, body);
          setMessages((prev) => mergeChatMessages(prev, [msg]));
        } catch (retryErr) {
          setThreadError(getChatErrorMessage(retryErr));
        }
      } else {
        setThreadError(getChatErrorMessage(err));
      }
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!selectedId || !accessToken) return;
    await chatApi.updateConversation(accessToken, selectedId, { status: "closed" });
    setConversations((prev) => prev.filter((c) => c.id !== selectedId));
    setSelectedId(null);
    setMessages([]);
    loadInbox();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Support inbox</h1>
          {unreadTotal > 0 && (
            <p className="text-sm text-secondary">{unreadTotal} unread across all threads</p>
          )}
        </div>
        <div className="flex gap-2">
          {(["all", "guests", "unread"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "guests" ? "Guests only" : "Unread only"}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-12rem)] overflow-hidden rounded-3xl border border-border bg-surface">
        {/* Inbox list */}
        <div className="w-full max-w-sm shrink-0 border-r border-border">
          {loadingList ? (
            <p className="p-4 text-sm text-secondary">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-secondary">No open conversations.</p>
          ) : (
            <ul className="divide-y divide-border overflow-y-auto">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors hover:bg-muted",
                      selectedId === c.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-primary">
                        {conversationDisplayName(c)}
                      </span>
                      {(c.unreadCount ?? 0) > 0 && (
                        <Badge variant="default" className="shrink-0 text-[10px]">
                          {c.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      {!c.userId && (
                        <Badge variant="secondary" className="text-[10px]">
                          Guest
                        </Badge>
                      )}
                      {emailSnippet(c) && (
                        <span className="truncate text-xs text-secondary">
                          {emailSnippet(c)}
                        </span>
                      )}
                    </div>
                    {c.lastMessagePreview && (
                      <p className="mt-1 truncate text-xs text-secondary">
                        {c.lastMessagePreview}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Thread */}
        <div className="flex min-w-0 flex-1 flex-col">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-secondary">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="font-medium text-primary">
                    {conversationDisplayName(selected)}
                  </p>
                  <p className="text-xs text-secondary">{emailSnippet(selected)}</p>
                  {(() => {
                    const link = adminContextLink(
                      selected.contextType,
                      selected.contextId
                    );
                    if (!link) return null;
                    return (
                      <Link
                        href={link.href}
                        className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                      >
                        {link.label}
                      </Link>
                    );
                  })()}
                </div>
                <Button size="sm" variant="outline" onClick={handleClose}>
                  Close conversation
                </Button>
              </div>
              {threadError && (
                <div className="border-b border-error/20 bg-error/10 px-4 py-2 text-center text-xs text-error">
                  {threadError}
                </div>
              )}
              <MessageList messages={messages} isLoading={loadingThread} />
              <MessageComposer onSend={handleSend} isSending={sending} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
