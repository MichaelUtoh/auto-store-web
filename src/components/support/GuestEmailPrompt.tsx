"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  dismissEmailPrompt,
  getStoredGuestDisplayName,
  isEmailPromptDismissed,
} from "@/lib/chat/identity";
import { useSupportChatStore } from "@/store/useSupportChatStore";
import { useSupportChat } from "./SupportChatProvider";

type GuestEmailPromptProps = {
  variant: "banner" | "sticky";
};

export function GuestEmailPrompt({ variant }: GuestEmailPromptProps) {
  const conversation = useSupportChatStore((s) => s.conversation);
  const guestMessagesSent = useSupportChatStore((s) => s.guestMessagesSent);
  const showAdminReplyPrompt = useSupportChatStore((s) => s.showAdminReplyPrompt);
  const { saveGuestEmail } = useSupportChat();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!conversation) return;
    setName(conversation.guestName ?? getStoredGuestDisplayName() ?? "");
  }, [conversation]);

  if (!conversation || conversation.guestEmail || hidden) return null;

  const dismissed = isEmailPromptDismissed();
  const showBanner =
    variant === "banner" &&
    guestMessagesSent >= 1 &&
    !showAdminReplyPrompt &&
    !dismissed;
  const showSticky = variant === "sticky" && showAdminReplyPrompt;

  if (!showBanner && !showSticky) return null;

  const handleSave = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await saveGuestEmail(email.trim(), name.trim() || undefined);
    } catch {
      setError("Could not save email. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    dismissEmailPrompt();
    setHidden(true);
  };

  return (
    <div
      className={cn(
        "border-border bg-muted/80 px-4 py-3",
        variant === "banner" ? "border-b" : "border-t"
      )}
    >
      <p className="text-sm text-primary">
        {showSticky
          ? "Support replied — add your email to get updates if you close this tab."
          : "Add your email so we can reply if you leave this page."}
      </p>
      <div className="mt-2 space-y-2">
        <div>
          <Label htmlFor="chat-guest-email" className="text-xs">
            Email
          </Label>
          <Input
            id="chat-guest-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-9"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label htmlFor="chat-guest-name" className="text-xs">
            Name (optional)
          </Label>
          <Input
            id="chat-guest-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-9"
            placeholder="Your name"
          />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {variant === "banner" && (
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
