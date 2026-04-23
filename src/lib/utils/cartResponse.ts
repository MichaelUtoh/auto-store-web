import type { CartItem } from "@/types/cart";

/**
 * Normalize cart line items from varying API envelopes:
 * `{ data: { items } }`, `{ items }`, `{ cart: { items } }`, snake_case keys, etc.
 */
export function normalizeCartItemsFromResponse(body: unknown): CartItem[] {
  if (body == null) return [];

  const tryExtract = (node: unknown): CartItem[] | null => {
    if (node == null) return null;
    if (Array.isArray(node)) return node as CartItem[];
    if (typeof node !== "object") return null;
    const o = node as Record<string, unknown>;
    const items = o.items ?? o.cart_items ?? o.line_items;
    if (Array.isArray(items)) return items as CartItem[];
    if (o.cart != null && typeof o.cart === "object") {
      const c = o.cart as Record<string, unknown>;
      const nested = c.items ?? c.cart_items;
      if (Array.isArray(nested)) return nested as CartItem[];
    }
    return null;
  };

  const direct = tryExtract(body);
  if (direct) return direct;

  if (typeof body === "object" && body !== null && "data" in body) {
    const inner = (body as { data: unknown }).data;
    const fromInner = tryExtract(inner);
    if (fromInner) return fromInner;
    if (inner != null && typeof inner === "object" && "data" in inner) {
      const nested = tryExtract((inner as { data: unknown }).data);
      if (nested) return nested;
    }
  }

  return [];
}
