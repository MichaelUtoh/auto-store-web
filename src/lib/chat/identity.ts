import { chatApi } from "@/lib/chat/api";
import type { ChatIdentity } from "@/types/supportChat";
import type { User } from "@/types/user";

const GUEST_TOKEN_KEY = "guest_chat_token";
const GUEST_ID_KEY = "guest_id";
const GUEST_REFRESHED_AT_KEY = "guest_chat_token_refreshed_at";
/** Refresh before typical TTL; backend may use shorter values. */
const GUEST_REFRESH_INTERVAL_MS = 45 * 60 * 1000;

export function getGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function getGuestId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_ID_KEY);
}

const GUEST_DISPLAY_NAME_KEY = "guest_chat_display_name";

export function getStoredGuestDisplayName(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const name = localStorage.getItem(GUEST_DISPLAY_NAME_KEY)?.trim();
  return name || undefined;
}

export function storeGuestDisplayName(name: string): void {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (trimmed) {
    localStorage.setItem(GUEST_DISPLAY_NAME_KEY, trimmed);
  }
}

export function clearGuestSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_TOKEN_KEY);
  localStorage.removeItem(GUEST_ID_KEY);
  localStorage.removeItem(GUEST_DISPLAY_NAME_KEY);
}

export function storeGuestSession(guestToken: string, guestId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_TOKEN_KEY, guestToken);
  localStorage.setItem(GUEST_ID_KEY, guestId);
  if (!localStorage.getItem(GUEST_REFRESHED_AT_KEY)) {
    localStorage.setItem(GUEST_REFRESHED_AT_KEY, String(Date.now()));
  }
}

async function refreshGuestTokenIfStale(guestToken: string): Promise<string> {
  if (typeof window === "undefined") return guestToken;
  const refreshedAt = parseInt(
    localStorage.getItem(GUEST_REFRESHED_AT_KEY) ?? "0",
    10
  );
  if (Date.now() - refreshedAt < GUEST_REFRESH_INTERVAL_MS) {
    return guestToken;
  }
  try {
    const session = await chatApi.refreshGuestSession(guestToken);
    storeGuestSession(session.guestToken, session.guestId);
    localStorage.setItem(GUEST_REFRESHED_AT_KEY, String(Date.now()));
    return session.guestToken;
  } catch {
    return guestToken;
  }
}

export async function resetGuestSession(): Promise<ChatIdentity> {
  const session = await chatApi.createGuestSession();
  storeGuestSession(session.guestToken, session.guestId);
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_REFRESHED_AT_KEY, String(Date.now()));
  }
  return {
    kind: "guest",
    token: session.guestToken,
    guestId: session.guestId,
  };
}

export async function ensureChatIdentity(
  user: User | null,
  accessToken: string | null
): Promise<ChatIdentity> {
  if (user && accessToken) {
    return { kind: "user", token: accessToken };
  }

  let guestToken = getGuestToken();
  if (!guestToken) {
    return resetGuestSession();
  }

  guestToken = await refreshGuestTokenIfStale(guestToken);

  return {
    kind: "guest",
    token: guestToken,
    guestId: getGuestId() ?? "",
  };
}

export async function linkGuestOnLogin(accessToken: string): Promise<void> {
  const guestToken = getGuestToken();
  if (!guestToken) return;
  await chatApi.linkGuest(guestToken, accessToken);
  clearGuestSession();
}

export const EMAIL_PROMPT_DISMISSED_KEY = "chat_email_prompt_dismissed_at";
const DISMISS_DAYS = 7;

export function isEmailPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(EMAIL_PROMPT_DISMISSED_KEY);
  if (!raw) return false;
  const dismissedAt = parseInt(raw, 10);
  if (!Number.isFinite(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function dismissEmailPrompt(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EMAIL_PROMPT_DISMISSED_KEY, String(Date.now()));
}
