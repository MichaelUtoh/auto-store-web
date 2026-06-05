import { apiClient } from "./client";
import type { Order, CreateOrderPayload } from "@/types/order";
import type { ApiResponse } from "@/types/api";
import {
  mapOrderFromApi,
  mapOrdersListFromApi,
} from "@/lib/utils/mapOrderFromApi";

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>("/orders", {
      shipping_address_id: payload.shippingAddressId,
      billing_address_id: payload.billingAddressId,
      payment_method: payload.paymentMethod,
    });
    const order = mapOrderFromApi(data);
    return order ? { data: order } : data;
  },

  getOrders: async (page = 1, limit = 10): Promise<Order[]> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>("/orders", {
      params: { page, limit },
    });
    return mapOrdersListFromApi(data);
  },

  getOrder: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(`/orders/${id}`);
    const order = mapOrderFromApi(data);
    return order ? { data: order } : data;
  },
};
