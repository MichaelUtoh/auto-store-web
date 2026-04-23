import { apiClient } from "./client";
import type {
  Product,
  Category,
  ProductSearchParams,
  CreateProductPayload,
} from "@/types/product";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export const productsApi = {
  getProducts: async (params: ProductSearchParams = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      "/products",
      { params }
    );
    return data;
  },

  getProduct: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return data;
  },

  getProductBySlug: async (slug: string) => {
    const { data } = await apiClient.get<ApiResponse<Product>>(
      `/products/slug/${slug}`
    );
    return data;
  },

  searchProducts: async (q: string, params: Omit<ProductSearchParams, "q"> = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      "/products/search",
      { params: { q, ...params } }
    );
    return data;
  },

  getCategories: async () => {
    const { data } = await apiClient.get<ApiResponse<Category[]>>("/categories");
    return data;
  },

  getCategoryBySlug: async (slug: string) => {
    const { data } = await apiClient.get<ApiResponse<Category>>(
      `/categories/slug/${slug}`
    );
    return data;
  },

  createProduct: async (payload: CreateProductPayload) => {
    const { data } = await apiClient.post<ApiResponse<Product>>(
      "/products",
      payload
    );
    const body = data as ApiResponse<Product>;
    return "data" in body ? body.data : (data as unknown as Product);
  },

  updateProduct: async (
    id: string,
    payload: Partial<CreateProductPayload>
  ) => {
    const { data } = await apiClient.put<ApiResponse<Product>>(
      `/products/${id}`,
      payload
    );
    const body = data as ApiResponse<Product>;
    return "data" in body ? body.data : (data as unknown as Product);
  },

  deleteProduct: async (id: string) => {
    await apiClient.delete(`/products/${id}`);
  },
};
