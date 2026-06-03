"use client";

import { Button } from "@/components/ui/button";
import { contextSwitchSummary } from "@/lib/chat/contextDisplay";
import { useSupportChatStore } from "@/store/useSupportChatStore";
import { useSupportChat } from "./SupportChatProvider";

export function ContextSwitchBanner() {
  const contextSwitchRequest = useSupportChatStore((s) => s.contextSwitchRequest);
  const { continueCurrentContext, startNewContextConversation } = useSupportChat();

  if (!contextSwitchRequest) return null;

  const summary = contextSwitchSummary(contextSwitchRequest);

  return (
    <div className="border-b border-border bg-muted/80 px-4 py-3">
      <p className="text-sm text-primary">
        You have an open support chat. Start a new conversation about {summary}?
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => startNewContextConversation()}>
          Start new chat
        </Button>
        <Button size="sm" variant="ghost" onClick={() => continueCurrentContext()}>
          Continue current
        </Button>
      </div>
    </div>
  );
}
