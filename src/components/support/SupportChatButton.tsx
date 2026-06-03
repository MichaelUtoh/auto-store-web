"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupportChatStore } from "@/store/useSupportChatStore";

export function SupportChatButton() {
  const isOpen = useSupportChatStore((s) => s.isOpen);
  const unreadCount = useSupportChatStore((s) => s.unreadCount);
  const openPanel = useSupportChatStore((s) => s.openPanel);

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => openPanel()}
      className={cn(
        "fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-float transition-transform hover:scale-105",
        "lg:bottom-6 lg:right-6"
      )}
      aria-label="Open support chat"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
