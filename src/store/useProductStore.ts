import { create } from "zustand";
import { productsApi } from "@/lib/api/products";
import type { Product, ProductSearchParams } from "@/types/product";

export interface FilterState {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  make?: string;
  model?: string;
  year?: number;
  tags?: string[];
  sort?: "price_asc" | "price_desc" | "newest" | "popular";
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductStore {
  products: Product[];
  filters: FilterState;
  pagination: PaginationState;
  isLoading: boolean;
  fetchProducts: (params?: ProductSearchParams) => Promise<void>;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
}

const defaultPagination: PaginationState = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filters: {},
  pagination: defaultPagination,
  isLoading: false,

  fetchProducts: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const merged = { ...filters, ...params };
      const res = await productsApi.getProducts(merged);
      const data = (res as { data?: { data: Product[]; total: number; page: number; limit: number; totalPages: number } }).data ?? res;
      const list = Array.isArray(data) ? data : (data as { data?: Product[] }).data ?? [];
      const total = (data as { total?: number }).total ?? list.length;
      const page = (data as { page?: number }).page ?? 1;
      const limit = (data as { limit?: number }).limit ?? 20;
      const totalPages =
        ((data as { totalPages?: number }).totalPages ?? Math.ceil(total / limit)) || 1;
      set({
        products: list,
        pagination: { page, limit, total, totalPages },
        filters: merged,
        isLoading: false,
      });
    } catch {
      set({ products: [], isLoading: false });
    }
  },

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),
}));
