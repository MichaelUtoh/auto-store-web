import type { ChatContext, ContextType, Conversation } from "@/types/supportChat";

export function conversationMatchesContext(
  conversation: Conversation,
  context: ChatContext
): boolean {
  const convType = (conversation.contextType ?? "general") as ContextType;
  const ctxType = context.contextType ?? "general";
  if (convType !== ctxType) return false;
  if (ctxType === "general") return true;
  return Boolean(context.contextId && conversation.contextId === context.contextId);
}

/** First 6 characters of conversation id, e.g. `#6CBEA3`. */
export function conversationIdLabel(conversationId: string): string {
  const prefix = conversationId.slice(0, 6).toUpperCase();
  return `#${prefix}`;
}

/** Label for admin inbox list and thread header. */
export function conversationDisplayName(conversation: Conversation): string {
  if (conversation.guestName?.trim()) {
    return conversation.guestName.trim();
  }
  if (conversation.customerDisplayName?.trim()) {
    return conversation.customerDisplayName.trim();
  }
  const fullName = `${conversation.userFirstName ?? ""} ${conversation.userLastName ?? ""}`.trim();
  if (fullName) return fullName;
  if (conversation.userEmail?.trim()) return conversation.userEmail.trim();
  if (conversation.guestEmail?.trim()) return conversation.guestEmail.trim();
  if (conversation.id) return conversationIdLabel(conversation.id);
  return "Unknown";
}

export function contextSwitchSummary(context: ChatContext): string {
  if (context.label) return context.label;
  if (context.contextType === "product") return "this product";
  if (context.contextType === "order") return "this order";
  return "this topic";
}

export function customerContextLink(
  contextType: string | null,
  contextId: string | null
): { label: string; href: string } | null {
  if (!contextType || contextType === "general" || !contextId) return null;
  if (contextType === "order") {
    return { label: "View order", href: `/account/orders/${contextId}` };
  }
  if (contextType === "product") {
    return { label: "View product", href: `/products/${contextId}` };
  }
  return null;
}

export function adminContextLink(
  contextType: string | null,
  contextId: string | null
): { label: string; href: string } | null {
  if (!contextType || contextType === "general" || !contextId) return null;
  if (contextType === "product") {
    return { label: "Open product in admin", href: `/admin/products/${contextId}/edit` };
  }
  if (contextType === "order") {
    return { label: "View customer order", href: `/account/orders/${contextId}` };
  }
  return null;
}

export function panelContextLabel(
  conversation: Conversation | null,
  activeContextLabel: string | null
): { label: string; href?: string } | null {
  if (activeContextLabel) {
    const link = conversation
      ? customerContextLink(conversation.contextType, conversation.contextId)
      : null;
    return { label: activeContextLabel, href: link?.href };
  }
  if (!conversation?.contextType || conversation.contextType === "general") {
    return null;
  }
  const link = customerContextLink(conversation.contextType, conversation.contextId);
  if (conversation.contextType === "product") {
    return { label: "About this product", href: link?.href };
  }
  if (conversation.contextType === "order") {
    return { label: "About this order", href: link?.href };
  }
  return null;
}
