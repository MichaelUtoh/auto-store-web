import { create } from "zustand";
import { cartApi } from "@/lib/api/cart";
import { normalizeCartItemsFromResponse } from "@/lib/utils/cartResponse";
import type { CartItem } from "@/types/cart";

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,

  addItem: async (productId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const res = await cartApi.addItem(productId, quantity);
      let items = normalizeCartItemsFromResponse(res);
      if (items.length === 0) {
        const refreshed = await cartApi.getCart();
        items = normalizeCartItemsFromResponse(refreshed);
      }
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to add to cart");
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const res = await cartApi.removeItem(itemId);
      const items = normalizeCartItemsFromResponse(res);
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to remove item");
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await get().removeItem(itemId);
      return;
    }
    set({ isLoading: true });
    try {
      const res = await cartApi.updateItem(itemId, quantity);
      const items = normalizeCartItemsFromResponse(res);
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to update quantity");
    }
  },

  clearCart: () => set({ items: [] }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await cartApi.getCart();
      const items = normalizeCartItemsFromResponse(res);
      set({ items, isLoading: false });
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  getTotalItems: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  getTotalPrice: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
