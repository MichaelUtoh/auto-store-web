import { useAuthStore } from "@/store/useAuthStore";

export function getHttpStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

export function getChatErrorMessage(err: unknown): string {
  const status = getHttpStatus(err);
  if (status === 403) {
    return "You don't have access to this conversation.";
  }
  if (status === 429) {
    return "Too many messages — wait a moment.";
  }
  if (status === 401) {
    return "Session expired. Please sign in again.";
  }
  const data = (err as { response?: { data?: { error?: string; message?: string } } })
    ?.response?.data;
  const msg = data?.error ?? data?.message;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  return "Something went wrong. Please try again.";
}

/** Refresh app session for logged-in chat; returns new token or null. */
export async function refreshUserChatToken(): Promise<string | null> {
  try {
    await useAuthStore.getState().refreshToken();
    return useAuthStore.getState().accessToken;
  } catch {
    return null;
  }
}
