import { create } from "zustand";
import { wishlistApi } from "@/lib/api/wishlist";
import type { Product } from "@/types/product";

interface WishlistStore {
  products: Product[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  products: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const products = await wishlistApi.getWishlist();
      set({ products, isLoading: false });
    } catch {
      set({ products: [], isLoading: false });
    }
  },

  addItem: async (productId: string) => {
    const prev = get().products;
    set({ isLoading: true });
    try {
      const products = await wishlistApi.addToWishlist(productId);
      set({ products, isLoading: false });
    } catch {
      set({ products: prev, isLoading: false });
      throw new Error("Failed to add to wishlist");
    }
  },

  removeItem: async (productId: string) => {
    const prev = get().products;
    set({
      products: prev.filter((p) => p.id !== productId),
      isLoading: true,
    });
    try {
      const products = await wishlistApi.removeFromWishlist(productId);
      set({ products, isLoading: false });
    } catch {
      set({ products: prev, isLoading: false });
      throw new Error("Failed to remove from wishlist");
    }
  },

  toggleItem: async (productId: string) => {
    if (get().isInWishlist(productId)) {
      await get().removeItem(productId);
    } else {
      await get().addItem(productId);
    }
  },

  isInWishlist: (productId: string) =>
    get().products.some((p) => p.id === productId),

  clearWishlist: () => set({ products: [], isLoading: false }),
}));
