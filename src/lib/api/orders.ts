import { apiClient } from "./client";
import type { Order, CreateOrderPayload } from "@/types/order";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload) => {
    const { data } = await apiClient.post<ApiResponse<Order>>("/orders", payload);
    return data;
  },

  getOrders: async (page = 1, limit = 10) => {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<Order>>
    >("/orders", { params: { page, limit } });
    return data;
  },

  getOrder: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return data;
  },
};
