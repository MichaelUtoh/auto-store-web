"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/supportChat";

function shouldShowTimestamp(current: ChatMessage, previous?: ChatMessage): boolean {
  if (!previous) return true;
  const gap =
    new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime();
  return gap >= 5 * 60 * 1000;
}

type MessageListProps = {
  messages: ChatMessage[];
  isLoading?: boolean;
};

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-secondary">
        Loading messages…
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-secondary">
        Ask us anything about orders, parts, or fitment.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
      {messages.map((msg, i) => {
        const prev = messages[i - 1];
        const showTime = shouldShowTimestamp(msg, prev);

        if (msg.senderType === "system") {
          return (
            <div key={msg.id} className="text-center">
              {showTime && (
                <time className="mb-1 block text-[10px] text-secondary">
                  {format(new Date(msg.createdAt), "h:mm a")}
                </time>
              )}
              <p className="text-xs text-secondary">{msg.body}</p>
            </div>
          );
        }

        const isCustomer = msg.senderType === "customer";

        return (
          <div
            key={msg.id}
            className={cn("flex flex-col", isCustomer ? "items-end" : "items-start")}
          >
            <div
              className={cn(
                "group max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                isCustomer
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-primary"
              )}
            >
              {showTime && (
                <time className="mb-1 block text-[10px] opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-70">
                  {format(new Date(msg.createdAt), "h:mm a")}
                </time>
              )}
              {msg.body}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
