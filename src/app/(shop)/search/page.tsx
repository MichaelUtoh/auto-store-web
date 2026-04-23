"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilter } from "@/components/product/ProductFilter";
import { Pagination } from "@/components/shared/Pagination";
import { useProductStore } from "@/store/useProductStore";
import { productsApi } from "@/lib/api/products";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { useState } from "react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const { products, pagination, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    productsApi.getCategories().then((res) => {
      const data = (res as { data?: { id: string; name: string; slug: string }[] }).data ?? res;
      setCategories(Array.isArray(data) ? data : []);
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
    fetchProducts({
      q: q || undefined,
      page,
      limit: ITEMS_PER_PAGE,
      category,
      sort,
    });
  }, [searchParams, q, fetchProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">
        {q ? `Search results for "${q}"` : "Search"}
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
            emptyMessage={q ? "No products match your search." : "Enter a search term above."}
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
