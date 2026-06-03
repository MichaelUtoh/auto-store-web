import { create } from "zustand";
import type { ChatContext, ChatMessage, Conversation } from "@/types/supportChat";

interface SupportChatStore {
  isOpen: boolean;
  conversation: Conversation | null;
  messages: ChatMessage[];
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  isReconnecting: boolean;
  wsConnected: boolean;
  guestMessagesSent: number;
  showAdminReplyPrompt: boolean;
  pendingContext: ChatContext | null;
  activeContextLabel: string | null;
  chatError: string | null;
  /** Shown when user opens chat with context that differs from the open thread. */
  contextSwitchRequest: ChatContext | null;
  openPanel: (context?: ChatContext) => void;
  closePanel: () => void;
  setChatError: (message: string | null) => void;
  setContextSwitchRequest: (context: ChatContext | null) => void;
  setConversation: (c: Conversation | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
  setUnreadCount: (n: number) => void;
  setLoading: (v: boolean) => void;
  setSending: (v: boolean) => void;
  setReconnecting: (v: boolean) => void;
  setWsConnected: (v: boolean) => void;
  incrementGuestMessagesSent: () => void;
  setShowAdminReplyPrompt: (v: boolean) => void;
  clearPendingContext: () => void;
  resetThread: () => void;
}

export const useSupportChatStore = create<SupportChatStore>((set) => ({
  isOpen: false,
  conversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  isReconnecting: false,
  wsConnected: false,
  guestMessagesSent: 0,
  showAdminReplyPrompt: false,
  pendingContext: null,
  activeContextLabel: null,
  chatError: null,
  contextSwitchRequest: null,

  openPanel: (context) =>
    set((s) => ({
      isOpen: true,
      pendingContext: context ?? s.pendingContext,
      activeContextLabel: context?.label ?? s.activeContextLabel,
      chatError: null,
      contextSwitchRequest: null,
    })),

  closePanel: () =>
    set({
      isOpen: false,
      activeContextLabel: null,
      chatError: null,
      contextSwitchRequest: null,
      pendingContext: null,
    }),

  setChatError: (chatError) => set({ chatError }),

  setContextSwitchRequest: (contextSwitchRequest) => set({ contextSwitchRequest }),

  setConversation: (conversation) => set({ conversation }),

  setMessages: (messages) => set({ messages }),

  appendMessage: (message) =>
    set((s) => {
      if (s.messages.some((m) => m.id === message.id)) return s;
      return { messages: [...s.messages, message] };
    }),

  setUnreadCount: (unreadCount) => set({ unreadCount }),

  setLoading: (isLoading) => set({ isLoading }),

  setSending: (isSending) => set({ isSending }),

  setReconnecting: (isReconnecting) => set({ isReconnecting }),

  setWsConnected: (wsConnected) => set({ wsConnected }),

  incrementGuestMessagesSent: () =>
    set((s) => ({ guestMessagesSent: s.guestMessagesSent + 1 })),

  setShowAdminReplyPrompt: (showAdminReplyPrompt) => set({ showAdminReplyPrompt }),

  clearPendingContext: () => set({ pendingContext: null }),

  resetThread: () =>
    set({
      conversation: null,
      messages: [],
      guestMessagesSent: 0,
      showAdminReplyPrompt: false,
      contextSwitchRequest: null,
    }),
}));

/** Open support chat from anywhere with optional context. */
export function openSupportChat(context?: ChatContext) {
  useSupportChatStore.getState().openPanel(context);
}
