"use client";

import { SupportChatProvider } from "./SupportChatProvider";
import { SupportChatButton } from "./SupportChatButton";
import { SupportChatPanel } from "./SupportChatPanel";

export function SupportChatWidget() {
  return (
    <SupportChatProvider>
      <SupportChatButton />
      <SupportChatPanel />
    </SupportChatProvider>
  );
}

export { openSupportChat } from "@/store/useSupportChatStore";
