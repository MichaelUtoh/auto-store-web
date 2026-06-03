"use client";

import { MessageCircle } from "lucide-react";
import { openSupportChat } from "@/store/useSupportChatStore";
import type { ContextType } from "@/types/supportChat";
import { cn } from "@/lib/utils";

type SupportHelpButtonProps = {
  contextType: ContextType;
  contextId?: string;
  /** Shown in widget header, e.g. "About order #1234" */
  contextLabel?: string;
  label?: string;
  className?: string;
};

export function SupportHelpButton({
  contextType,
  contextId,
  contextLabel,
  label = "Need help?",
  className,
}: SupportHelpButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        openSupportChat({
          contextType,
          contextId,
          label: contextLabel,
        })
      }
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-primary",
        "underline-offset-4 hover:underline",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
      {label}
    </button>
  );
}
