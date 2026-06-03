"use client";

import { openSupportChat } from "@/store/useSupportChatStore";
import { useAuthStore } from "@/store/useAuthStore";

export function FooterSupportLink() {
  const user = useAuthStore((s) => s.user);
  if (user?.role?.toLowerCase() === "admin") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => openSupportChat({ contextType: "general" })}
      className="text-sm font-medium text-secondary transition-colors hover:text-foreground"
    >
      Contact support
    </button>
  );
}
