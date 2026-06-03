"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilter } from "@/components/product/ProductFilter";
import { ProductSearch } from "@/components/product/ProductSearch";
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
import { GarageVehicleChip } from "@/components/garage/GarageVehicleChip";
import Link from "next/link";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const [categories, setCategories] = useState<CategoryFilterOption[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
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
    <div className="page-container py-6 sm:py-8">
      <h1 className="page-title">
        {searchQuery ? "Search results" : "Search"}
      </h1>
      {searchQuery && (
        <p className="mt-2 text-sm text-secondary">
          Showing results for &ldquo;{searchQuery}&rdquo;
          {!isLoading && ` · ${pagination.total} found`}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ProductSearch basePath="/search" showButton />
        <GarageVehicleChip />
      </div>

      <div className="mt-6 flex justify-end lg:hidden">
        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          className="rounded-pill border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-muted"
        >
          {filterOpen ? "Hide filters" : "Filters"}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-8 md:flex-row md:gap-10">
        <div className={`md:w-72 md:shrink-0 ${filterOpen ? "block" : "hidden md:block"}`}>
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
          {!isLoading && products.length === 0 && (
            <p className="mt-6 text-center text-sm text-secondary">
              Not sure what you need?{" "}
              <Link
                href="/parts"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Use the visual part finder
              </Link>
            </p>
          )}
          <div className="mt-10">
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
