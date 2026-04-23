import { apiClient } from "./client";
import type { User, RegisterData, AuthTokens } from "@/types/user";
import type { ApiResponse } from "@/types/api";

/** Backend login/register response shape (snake_case) */
interface BackendAuthPayload {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: string;
    phone?: string;
    avatar?: string;
    email_verified?: boolean;
    created_at: string;
    updated_at?: string;
  };
}

function unwrap<T>(res: { data: ApiResponse<T> | { success?: boolean; data: T } }): T {
  const body = res.data as { data?: T; success?: boolean };
  return body && "data" in body && body.data !== undefined
    ? body.data
    : (res.data as unknown as T);
}

function mapBackendUser(u: BackendAuthPayload["user"]): User {
  return {
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    role: u.role as User["role"],
    phone: u.phone,
    avatar: u.avatar,
    createdAt: u.created_at,
    updatedAt: u.updated_at ?? u.created_at,
  };
}

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ success?: boolean; data: BackendAuthPayload }>(
      "/auth/login",
      { email, password }
    );
    const raw = unwrap(res) as BackendAuthPayload;
    return {
      user: mapBackendUser(raw.user),
      accessToken: raw.access_token,
      refreshToken: raw.refresh_token,
      expiresIn: raw.expires_at ? undefined : undefined,
    };
  },

  register: async (payload: RegisterData) => {
    const res = await apiClient.post<{ success?: boolean; data: BackendAuthPayload }>(
      "/auth/register",
      payload
    );
    const raw = unwrap(res) as BackendAuthPayload;
    return {
      user: mapBackendUser(raw.user),
      accessToken: raw.access_token,
      refreshToken: raw.refresh_token,
    };
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  refresh: async () => {
    const res = await apiClient.post<{ success?: boolean; data: { access_token: string; refresh_token?: string } }>(
      "/auth/refresh"
    );
    const raw = unwrap(res) as { access_token: string; refresh_token?: string };
    return {
      accessToken: raw.access_token,
      refreshToken: raw.refresh_token,
    };
  },

  getProfile: async () => {
    const res = await apiClient.get<{ success?: boolean; data: BackendAuthPayload["user"] }>(
      "/auth/me"
    );
    const raw = unwrap(res) as BackendAuthPayload["user"];
    return mapBackendUser(raw);
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post<ApiResponse<{ ok: boolean }>>(
      "/auth/forgot-password",
      { email }
    );
    return unwrap(res);
  },
};
