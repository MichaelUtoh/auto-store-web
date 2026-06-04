import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import toast from "react-hot-toast";

export interface ApiRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  /** When true, the response interceptor will not show a toast for this request. */
  skipErrorToast?: boolean;
}

let sessionExpiryHandled = false;

function isAuthRefreshRequest(url?: string): boolean {
  if (!url) return false;
  return url.includes("/auth/refresh") || url.includes("/auth/login");
}

function handleSessionExpired(): void {
  if (sessionExpiryHandled) return;
  sessionExpiryHandled = true;
  toast.dismiss();
  toast.error("Session expired. Sign in again.");
  useAuthStore.getState().logout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as ApiRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRefreshRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        await useAuthStore.getState().refreshToken();
        const newToken = useAuthStore.getState().accessToken;
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        handleSessionExpired();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    const skipToast = originalRequest?.skipErrorToast === true;
    if (typeof window !== "undefined" && !skipToast && !sessionExpiryHandled) {
      toast.error(getApiErrorMessage(error));
    }
    return Promise.reject(error);
  }
);

/** Call after a successful login so the next expiry can show a toast again. */
export function resetSessionExpiryFlag(): void {
  sessionExpiryHandled = false;
}
