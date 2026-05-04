import { create } from "zustand";
import { productsApi } from "@/lib/api/products";
import type { Product, ProductSearchParams } from "@/types/product";

export interface FilterState {
  search?: string;
  category?: string;
  min?: number;
  max?: number;
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
      type ProductsListMeta = {
        page?: number;
        limit?: number;
        total?: number;
        total_pages?: number;
        totalPages?: number;
      };
      type ProductsListBody = {
        data?: Product[] | { data: Product[] };
        meta?: ProductsListMeta;
      };
      const body = res as ProductsListBody;
      const meta = body.meta;
      const raw = body.data;
      const list = Array.isArray(raw)
        ? raw
        : raw &&
            typeof raw === "object" &&
            "data" in raw &&
            Array.isArray((raw as { data: Product[] }).data)
          ? (raw as { data: Product[] }).data
          : [];
      const total = meta?.total ?? list.length;
      const page = meta?.page ?? merged.page ?? 1;
      const limit = meta?.limit ?? merged.limit ?? 20;
      const totalPagesFromMeta =
        meta?.total_pages ?? meta?.totalPages ?? Math.ceil(total / Math.max(limit, 1));
      const totalPages = Math.max(1, totalPagesFromMeta);
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
