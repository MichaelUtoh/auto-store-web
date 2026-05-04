"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilter } from "@/components/product/ProductFilter";
import { Pagination } from "@/components/shared/Pagination";
import { useProductStore } from "@/store/useProductStore";
import { productsApi } from "@/lib/api/products";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import {
  flattenCategoryFilterOptions,
  type CategoryFilterOption,
  type CategoryTreeNode,
} from "@/lib/utils/categories";
import { parsePriceQueryParam } from "@/lib/utils/parsePriceParam";
import { useState } from "react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const [categories, setCategories] = useState<CategoryFilterOption[]>([]);
  const { products, pagination, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    productsApi.getCategories().then((res) => {
      const data = (res as { data?: unknown }).data ?? res;
      const list = Array.isArray(data) ? data : [];
      setCategories(flattenCategoryFilterOptions(list as CategoryTreeNode[]));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const category = searchParams.get("category") ?? undefined;
    const sort = (searchParams.get("sort") ?? undefined) as
      | "price_asc"
      | "price_desc"
      | "newest"
      | "popular"
      | undefined;
    const min = parsePriceQueryParam(
      searchParams.get("min") ?? searchParams.get("minPrice")
    );
    const max = parsePriceQueryParam(
      searchParams.get("max") ?? searchParams.get("maxPrice")
    );
    fetchProducts({
      search: searchQuery || undefined,
      page,
      limit: ITEMS_PER_PAGE,
      category,
      sort,
      min,
      max,
    });
  }, [searchParams, searchQuery, fetchProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">
        {searchQuery ? `Search results for "${searchQuery}"` : "Search"}
      </h1>
      <p className="mt-2 text-secondary">
        {!isLoading && products.length >= 0 && `${pagination.total} results`}
      </p>
      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-64 lg:shrink-0">
          <ProductFilter categories={categories} />
        </div>
        <div className="min-w-0 flex-1">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            emptyMessage={
              searchQuery
                ? "No products match your search."
                : "Enter a search term above."
            }
          />
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              basePath="/search"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
