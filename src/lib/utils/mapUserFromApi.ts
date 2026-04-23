import type { User, UserRole } from "@/types/user";

/** Typical `/users/me` JSON (snake_case and/or camelCase). */
export type BackendUserPayload = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Unwrap one level of `{ data: T }` from an API response body. */
export function unwrapApiDataBody(body: unknown): unknown {
  if (body == null || typeof body !== "object") return body;
  const b = body as Record<string, unknown>;
  if ("data" in b && b.data !== undefined && b.data !== null) {
    return b.data;
  }
  return body;
}

export function mapUserFromApi(raw: unknown): User {
  const r = raw as BackendUserPayload;
  if (!r || typeof r !== "object" || !r.id || !r.email) {
    throw new Error("Invalid user payload from API");
  }
  return {
    id: r.id,
    email: r.email,
    firstName: (r.firstName ?? r.first_name ?? "").trim(),
    lastName: (r.lastName ?? r.last_name ?? "").trim(),
    phone: r.phone,
    avatar: r.avatar,
    role: r.role as UserRole | undefined,
    createdAt: r.createdAt ?? r.created_at ?? "",
    updatedAt: r.updatedAt ?? r.updated_at ?? r.createdAt ?? r.created_at ?? "",
  };
}
