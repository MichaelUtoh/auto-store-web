import type { AxiosError } from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (!error || typeof error !== "object") return fallback;
  const axiosErr = error as AxiosError<{ message?: string; error?: string }>;
  const data = axiosErr.response?.data;
  const errStr =
    typeof data?.error === "string" ? data.error.trim() : "";
  const msgStr =
    typeof data?.message === "string" ? data.message.trim() : "";
  if (errStr) return errStr;
  if (msgStr) return msgStr;
  if (axiosErr.message && axiosErr.message !== "Network Error") {
    return axiosErr.message;
  }
  const status = axiosErr.response?.status;
  if (status === 401) return "Session expired. Sign in again.";
  if (status === 403) return "You don't have permission to perform this action.";
  if (status === 413) return "Request too large. Try a smaller image.";
  if (status === 503) return "Service temporarily unavailable. Try again later.";
  return fallback;
}
