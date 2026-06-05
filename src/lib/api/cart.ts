import { apiClient } from "./client";
import type { Cart, CartItem } from "@/types/cart";
import type { ApiResponse } from "@/types/api";

export const cartApi = {
  getCart: async () => {
    const { data } = await apiClient.get<ApiResponse<Cart>>("/cart");
    return data;
  },

  addItem: async (productId: string, quantity: number) => {
    const { data } = await apiClient.post<ApiResponse<Cart>>("/cart/items", {
      product_id: productId,
      quantity,
    });
    return data;
  },

  updateItem: async (itemId: string, quantity: number) => {
    const { data } = await apiClient.put<ApiResponse<Cart>>(
      `/cart/items/${itemId}`,
      { quantity }
    );
    return data;
  },

  removeItem: async (itemId: string) => {
    const { data } = await apiClient.delete<ApiResponse<Cart>>(
      `/cart/items/${itemId}`
    );
    return data;
  },

  clearCart: async () => {
    const { data } = await apiClient.delete<ApiResponse<Cart>>("/cart");
    return data;
  },
};
