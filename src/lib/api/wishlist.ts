import { apiClient } from "./client";
import { productsApi } from "@/lib/api/products";
import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";
import {
  mapProductFromApi,
  productHasCardImage,
} from "@/lib/utils/mapProductFromApi";
import {
  mapWishlistProductIdsFromApi,
  mapWishlistProductsFromApi,
} from "@/lib/utils/mapWishlistFromApi";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

async function loadProductById(id: string): Promise<Product | null> {
  try {
    const res = await productsApi.getProduct(id);
    const raw = unwrapApiDataBody(res);
    const mapped = mapProductFromApi(raw);
    if (mapped) return mapped;
    if (raw && typeof raw === "object") {
      return mapProductFromApi({ ...(raw as Record<string, unknown>), id });
    }
    return null;
  } catch {
    return null;
  }
}

async function loadProductsByIds(ids: string[]): Promise<Product[]> {
  const results = await Promise.all(ids.map(loadProductById));
  return results.filter((p): p is Product => p != null);
}

/** Fill in images (and other fields) when wishlist preload omits gallery URLs. */
async function enrichProductsMissingImages(
  products: Product[]
): Promise<Product[]> {
  return Promise.all(
    products.map(async (p) => {
      if (productHasCardImage(p)) return p;
      const full = await loadProductById(p.id);
      return full ?? p;
    })
  );
}

export const wishlistApi = {
  getWishlist: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>("/wishlist");
    let products = mapWishlistProductsFromApi(data);
    if (products.length === 0) {
      const ids = mapWishlistProductIdsFromApi(data);
      if (ids.length === 0) return [];
      products = await loadProductsByIds(ids);
    }
    return enrichProductsMissingImages(products);
  },

  addToWishlist: async (productId: string): Promise<Product[]> => {
    const { data } = await apiClient.post<ApiResponse<unknown>>("/wishlist", {
      product_id: productId,
    });
    const products = mapWishlistProductsFromApi(data);
    if (products.length > 0) {
      return enrichProductsMissingImages(products);
    }
    return wishlistApi.getWishlist();
  },

  removeFromWishlist: async (productId: string): Promise<Product[]> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(
      `/wishlist/${productId}`
    );
    const products = mapWishlistProductsFromApi(data);
    if (products.length > 0) {
      return enrichProductsMissingImages(products);
    }
    return wishlistApi.getWishlist();
  },
};
