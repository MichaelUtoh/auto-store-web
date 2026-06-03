"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_CHARS = 2000;

type MessageComposerProps = {
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
  isSending?: boolean;
};

export function MessageComposer({ onSend, disabled, isSending }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSend = useCallback(async () => {
    const body = text.trim();
    if (!body || body.length > MAX_CHARS) return;
    setError("");
    try {
      await onSend(body);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    }
  }, [text, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && text.length <= MAX_CHARS && !disabled && !isSending;

  return (
    <div className="border-t border-border p-3">
      {error && <p className="mb-2 text-xs text-error">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={2}
          disabled={disabled || isSending}
          className={cn(
            "input-field min-h-[44px] flex-1 resize-none py-2.5 text-sm",
            disabled && "opacity-50"
          )}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {text.length > MAX_CHARS * 0.9 && (
        <p className="mt-1 text-right text-[10px] text-secondary">
          {text.length}/{MAX_CHARS}
        </p>
      )}
    </div>
  );
}
