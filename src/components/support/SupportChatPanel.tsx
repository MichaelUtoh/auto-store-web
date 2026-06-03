"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { panelContextLabel } from "@/lib/chat/contextDisplay";
import { useAuthStore } from "@/store/useAuthStore";
import { useSupportChatStore } from "@/store/useSupportChatStore";
import { useSupportChat } from "./SupportChatProvider";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { GuestEmailPrompt } from "./GuestEmailPrompt";
import { ContextSwitchBanner } from "./ContextSwitchBanner";

export function SupportChatPanel() {
  const isOpen = useSupportChatStore((s) => s.isOpen);
  const closePanel = useSupportChatStore((s) => s.closePanel);
  const conversation = useSupportChatStore((s) => s.conversation);
  const messages = useSupportChatStore((s) => s.messages);
  const isLoading = useSupportChatStore((s) => s.isLoading);
  const isSending = useSupportChatStore((s) => s.isSending);
  const isReconnecting = useSupportChatStore((s) => s.isReconnecting);
  const chatError = useSupportChatStore((s) => s.chatError);
  const activeContextLabel = useSupportChatStore((s) => s.activeContextLabel);
  const user = useAuthStore((s) => s.user);
  const { sendMessage, closeConversation } = useSupportChat();

  if (!isOpen) return null;

  const ctx = panelContextLabel(conversation, activeContextLabel);
  const isGuest = !user;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-overlay/40 backdrop-blur-[2px] sm:hidden"
        aria-hidden="true"
        onClick={closePanel}
      />
      <div
        className={cn(
          "fixed z-50 flex flex-col bg-background shadow-float",
          "inset-0 sm:inset-auto sm:bottom-6 sm:right-6",
          "sm:h-[520px] sm:w-[380px] sm:rounded-3xl sm:border sm:border-border",
          "animate-in slide-in-from-bottom duration-200 sm:slide-in-from-right"
        )}
        role="dialog"
        aria-label="Support chat"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-primary">Support</h2>
            {ctx && (
              <Link
                href={ctx.href ?? "#"}
                className="mt-0.5 block truncate text-xs text-secondary hover:text-primary"
                onClick={(e) => {
                  if (!ctx.href) e.preventDefault();
                }}
              >
                {ctx.label}
              </Link>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={closePanel} aria-label="Close chat">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </div>

        {chatError && (
          <div className="border-b border-error/20 bg-error/10 px-4 py-2 text-center text-xs text-error">
            {chatError}
          </div>
        )}

        <ContextSwitchBanner />

        {isGuest && <GuestEmailPrompt variant="banner" />}

        {isReconnecting && (
          <div className="bg-muted px-4 py-1.5 text-center text-xs text-secondary">
            Reconnecting…
          </div>
        )}

        <MessageList messages={messages} isLoading={isLoading} />

        {isGuest && <GuestEmailPrompt variant="sticky" />}

        <MessageComposer
          onSend={sendMessage}
          disabled={isLoading || !conversation}
          isSending={isSending}
        />

        {conversation && (
          <div className="border-t border-border px-4 py-2 text-center">
            <button
              type="button"
              onClick={() => closeConversation()}
              className="text-xs text-secondary hover:text-primary hover:underline"
            >
              Mark as resolved
            </button>
          </div>
        )}
      </div>
    </>
  );
}
