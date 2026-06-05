import type { AddressType, SavedAddress } from "@/types/address";
import type { AddressInput } from "@/lib/utils/validators";
import type { OrderAddress } from "@/types/order";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

function normalizeCountry(country: string): string {
  const t = country.trim();
  if (t === "US" || t === "us") return "USA";
  return t;
}

/** Form → POST /users/me/addresses body */
export function addressInputToCreateBody(
  input: AddressInput,
  type: AddressType,
  isDefault = false
): {
  type: AddressType;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
} {
  const street = [input.line1.trim(), input.line2?.trim()]
    .filter(Boolean)
    .join(", ");
  return {
    type,
    street,
    city: input.city.trim(),
    state: input.state.trim(),
    postal_code: input.postalCode.trim(),
    country: normalizeCountry(input.country),
    is_default: isDefault,
  };
}

export function mapAddressFromApi(raw: unknown): SavedAddress | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const id = a.id;
  if (id == null || id === "") return null;
  const typeRaw = a.type;
  const type: AddressType =
    typeRaw === "billing" ? "billing" : "shipping";
  return {
    id: String(id),
    type,
    street: String(a.street ?? a.line1 ?? ""),
    city: String(a.city ?? ""),
    state: String(a.state ?? ""),
    postalCode: String(a.postal_code ?? a.postalCode ?? ""),
    country: String(a.country ?? ""),
    isDefault: Boolean(a.is_default ?? a.isDefault),
  };
}

export function mapAddressesFromApi(body: unknown): SavedAddress[] {
  const unwrapped = unwrapApiDataBody(body);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray((unwrapped as { data?: unknown[] })?.data)
      ? (unwrapped as { data: unknown[] }).data
      : [];
  return list
    .map(mapAddressFromApi)
    .filter((a): a is SavedAddress => a != null);
}

/** Display helper for account / order pages */
export function savedAddressToDisplayLines(addr: SavedAddress): string[] {
  return [
    addr.street,
    `${addr.city}, ${addr.state} ${addr.postalCode}`,
    addr.country,
  ].filter(Boolean);
}

/** Map API order shipping blob → legacy OrderAddress display shape */
export function mapOrderShippingAddressFromApi(raw: unknown): OrderAddress {
  if (!raw || typeof raw !== "object") {
    return {
      firstName: "",
      lastName: "",
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
    };
  }
  const a = raw as Record<string, unknown>;
  const street = String(a.street ?? a.line1 ?? "");
  return {
    firstName: String(a.first_name ?? a.firstName ?? ""),
    lastName: String(a.last_name ?? a.lastName ?? ""),
    line1: street,
    line2: (a.line2 as string | undefined) ?? undefined,
    city: String(a.city ?? ""),
    state: String(a.state ?? ""),
    postalCode: String(a.postal_code ?? a.postalCode ?? ""),
    country: String(a.country ?? ""),
    phone: String(a.phone ?? ""),
  };
}
