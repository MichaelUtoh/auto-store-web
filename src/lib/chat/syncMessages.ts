import type { ChatMessage } from "@/types/supportChat";

/** Merge API messages into existing list without duplicate ids. */
export function mergeChatMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  if (incoming.length === 0) return existing;
  const seen = new Set(existing.map((m) => m.id));
  const added = incoming.filter((m) => m.id && !seen.has(m.id));
  if (added.length === 0) return existing;
  return [...existing, ...added].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function lastMessageTimestamp(messages: ChatMessage[]): string | undefined {
  if (messages.length === 0) return undefined;
  return messages[messages.length - 1]?.createdAt;
}
