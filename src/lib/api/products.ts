import { apiClient } from "./client";
import type {
  Product,
  Category,
  ProductSearchParams,
  CreateProductPayload,
} from "@/types/product";
import type {
  LinkProductCompatibilitiesPayload,
  ProductVehicleCompatibility,
} from "@/types/vehicleCompatibility";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { mapProductVehicleCompatibilityListFromApi } from "@/lib/utils/mapVehicleCompatibilityFromApi";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

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

  searchProducts: async (
    term: string,
    params: Omit<ProductSearchParams, "search"> = {}
  ) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      "/products/search",
      { params: { search: term, ...params } }
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

  getProductCompatibility: async (
    productId: string
  ): Promise<ProductVehicleCompatibility[]> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(
      `/products/${productId}/compatibility`
    );
    return mapProductVehicleCompatibilityListFromApi(unwrapApiDataBody(data));
  },

  linkProductCompatibility: async (
    productId: string,
    payload: LinkProductCompatibilitiesPayload
  ): Promise<ProductVehicleCompatibility[]> => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/products/${productId}/compatibility`,
      payload
    );
    return mapProductVehicleCompatibilityListFromApi(unwrapApiDataBody(data));
  },
};
