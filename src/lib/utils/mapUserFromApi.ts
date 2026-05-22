import type { MechanicProfile, User, UserRole } from "@/types/user";

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
  mechanic_profile?: {
    id?: string;
    status?: string;
    business_name?: string;
    businessName?: string;
    is_verified?: boolean;
    isVerified?: boolean;
  };
  mechanicProfile?: BackendUserPayload["mechanic_profile"];
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
};

function mapMechanicProfileFromApi(
  raw: BackendUserPayload["mechanic_profile"]
): MechanicProfile | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  return {
    id: String(raw.id ?? ""),
    status: String(raw.status ?? ""),
    businessName: String(raw.business_name ?? raw.businessName ?? ""),
    isVerified: Boolean(raw.is_verified ?? raw.isVerified),
  };
}

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
    mechanicProfile: mapMechanicProfileFromApi(
      r.mechanicProfile ?? r.mechanic_profile
    ),
    createdAt: r.createdAt ?? r.created_at ?? "",
    updatedAt: r.updatedAt ?? r.updated_at ?? r.createdAt ?? r.created_at ?? "",
  };
}
