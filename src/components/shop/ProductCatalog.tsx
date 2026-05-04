"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { productsApi } from "@/lib/api/products";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilter } from "@/components/product/ProductFilter";
import { Pagination } from "@/components/shared/Pagination";
import { useProductStore } from "@/store/useProductStore";
import {
  flattenCategoryFilterOptions,
  type CategoryFilterOption,
  type CategoryTreeNode,
} from "@/lib/utils/categories";
import { parsePriceQueryParam } from "@/lib/utils/parsePriceParam";

type SortKey = "price_asc" | "price_desc" | "newest" | "popular";

export function ProductCatalog({
  title = "Products",
  basePath = "/products",
  emptyMessage = "No products match your filters. Try adjusting or clear filters.",
}: {
  title?: string;
  basePath?: string;
  emptyMessage?: string;
}) {
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<CategoryFilterOption[]>([]);

  const { products, pagination, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    productsApi
      .getCategories()
      .then((res) => {
        const data = (res as { data?: unknown }).data ?? res;
        const list = Array.isArray(data) ? data : [];
        setCategories(flattenCategoryFilterOptions(list as CategoryTreeNode[]));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const search = searchParams.get("search") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const sort = (searchParams.get("sort") ?? undefined) as SortKey | undefined;
    const min = parsePriceQueryParam(
      searchParams.get("min") ?? searchParams.get("minPrice")
    );
    const max = parsePriceQueryParam(
      searchParams.get("max") ?? searchParams.get("maxPrice")
    );

    fetchProducts({
      page,
      limit: ITEMS_PER_PAGE,
      search,
      category,
      sort,
      min,
      max,
    });
  }, [searchParams, fetchProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">{title}</h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-64 lg:shrink-0">
          <ProductFilter categories={categories} />
        </div>

        <div className="min-w-0 flex-1">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
          />

          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              basePath={basePath}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

