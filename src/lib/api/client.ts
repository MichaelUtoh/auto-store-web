import axios, { type AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

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
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await useAuthStore.getState().refreshToken();
        const newToken = useAuthStore.getState().accessToken;
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    const responseData = error.response?.data;
    const errStr =
      typeof responseData?.error === "string" ? responseData.error.trim() : "";
    const msgStr =
      typeof responseData?.message === "string"
        ? responseData.message.trim()
        : "";
    const status = error.response?.status;
    const statusFallback =
      status === 401
        ? "Session expired. Sign in again."
        : status === 403
          ? "You don't have permission to perform this action."
          : status === 413
            ? "Request too large. Try smaller files (max 5 MB per image)."
            : status === 503
              ? "Service temporarily unavailable. Try again later."
              : undefined;
    const message =
      errStr ||
      msgStr ||
      statusFallback ||
      error.message ||
      "Something went wrong";
    if (typeof window !== "undefined") {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);
