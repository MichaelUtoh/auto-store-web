import { apiClient } from "./client";
import type { User } from "@/types/user";
import type { ApiResponse } from "@/types/api";
import type { OrderAddress } from "@/types/order";
import {
  mapUserFromApi,
  unwrapApiDataBody,
} from "@/lib/utils/mapUserFromApi";

/** PATCH body many backends expect (snake_case). */
function profilePatchBody(payload: Partial<User>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.firstName !== undefined) body.first_name = payload.firstName;
  if (payload.lastName !== undefined) body.last_name = payload.lastName;
  if (payload.phone !== undefined) body.phone = payload.phone;
  if (payload.avatar !== undefined) body.avatar = payload.avatar;
  return body;
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>("/users/me");
    const raw = unwrapApiDataBody(data);
    return mapUserFromApi(raw);
  },

  updateProfile: async (payload: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<unknown>>(
      "/users/me",
      profilePatchBody(payload)
    );
    const raw = unwrapApiDataBody(data);
    if (
      raw &&
      typeof raw === "object" &&
      "id" in raw &&
      "email" in raw
    ) {
      return mapUserFromApi(raw);
    }
    return usersApi.getProfile();
  },

  getAddresses: async () => {
    const { data } = await apiClient.get<ApiResponse<OrderAddress[]>>(
      "/users/me/addresses"
    );
    return data;
  },

  addAddress: async (payload: OrderAddress) => {
    const { data } = await apiClient.post<ApiResponse<OrderAddress>>(
      "/users/me/addresses",
      payload
    );
    return data;
  },

  updateAddress: async (id: string, payload: Partial<OrderAddress>) => {
    const { data } = await apiClient.patch<ApiResponse<OrderAddress>>(
      `/users/me/addresses/${id}`,
      payload
    );
    return data;
  },

  deleteAddress: async (id: string) => {
    await apiClient.delete(`/users/me/addresses/${id}`);
  },

  getWishlist: async () => {
    const { data } = await apiClient.get<ApiResponse<string[]>>(
      "/users/me/wishlist"
    );
    return data;
  },

  addToWishlist: async (productId: string) => {
    const { data } = await apiClient.post<ApiResponse<string[]>>(
      "/users/me/wishlist",
      { productId }
    );
    return data;
  },

  removeFromWishlist: async (productId: string) => {
    const { data } = await apiClient.delete<ApiResponse<string[]>>(
      `/users/me/wishlist/${productId}`
    );
    return data;
  },
};
