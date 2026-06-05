import type { CartItem } from "@/types/cart";
import { mapCartItemsFromApi } from "@/lib/utils/mapCartFromApi";

/** @deprecated Use mapCartItemsFromApi — kept for existing imports. */
export function normalizeCartItemsFromResponse(body: unknown): CartItem[] {
  return mapCartItemsFromApi(body);
}
