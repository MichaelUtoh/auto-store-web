import { create } from "zustand";
import { cartApi } from "@/lib/api/cart";
import {
  enrichCartItemsMissingImages,
  mapCartItemsFromApi,
} from "@/lib/utils/mapCartFromApi";
import type { CartItem } from "@/types/cart";

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/** DELETE/PUT may return 204 or empty body — refetch when mapping yields nothing. */
async function resolveCartItemsFromResponse(
  res: unknown
): Promise<CartItem[]> {
  let items = mapCartItemsFromApi(res);
  if (items.length === 0) {
    const refreshed = await cartApi.getCart();
    items = mapCartItemsFromApi(refreshed);
  }
  return enrichCartItemsMissingImages(items);
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,

  addItem: async (productId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const res = await cartApi.addItem(productId, quantity);
      const items = await resolveCartItemsFromResponse(res);
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to add to cart");
    }
  },

  removeItem: async (itemId: string) => {
    const prev = get().items;
    set({ isLoading: true });
    try {
      const res = await cartApi.removeItem(itemId);
      const items = await resolveCartItemsFromResponse(res);
      set({ items, isLoading: false });
    } catch {
      set({ items: prev, isLoading: false });
      throw new Error("Failed to remove item");
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await get().removeItem(itemId);
      return;
    }
    const prev = get().items;
    set({ isLoading: true });
    try {
      const res = await cartApi.updateItem(itemId, quantity);
      const items = await resolveCartItemsFromResponse(res);
      set({ items, isLoading: false });
    } catch {
      set({ items: prev, isLoading: false });
      throw new Error("Failed to update quantity");
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clearCart();
    } catch {
      /* still clear local state after checkout */
    }
    set({ items: [], isLoading: false });
  },

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await cartApi.getCart();
      const items = await enrichCartItemsMissingImages(mapCartItemsFromApi(res));
      set({ items, isLoading: false });
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  getTotalItems: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  getTotalPrice: () =>
    get().items.reduce((sum, item) => {
      const line = item.price * item.quantity;
      return sum + (Number.isFinite(line) ? line : 0);
    }, 0),
}));
