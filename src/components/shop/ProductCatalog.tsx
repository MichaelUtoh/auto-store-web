"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { productsApi } from "@/lib/api/products";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilter } from "@/components/product/ProductFilter";
import { CategoryScroller } from "@/components/product/CategoryScroller";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Pagination } from "@/components/shared/Pagination";
import { ProductSearch } from "@/components/product/ProductSearch";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
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
  showHero = false,
}: {
  title?: string;
  basePath?: string;
  emptyMessage?: string;
  showHero?: boolean;
}) {
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<CategoryFilterOption[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const { products, pagination, isLoading, fetchProducts } = useProductStore();

  const isHome = basePath === "/";

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
    <div className="page-container py-6 sm:py-8 md:py-10">
      {(showHero || isHome) && (
        <section className="mb-8 sm:mb-10">
          <HeroCarousel
            title="Discover quality auto parts"
            subtitle="Everything you need to keep your vehicle running smoothly."
          />
          <div className="mt-5 lg:hidden">
            <ProductSearch basePath={basePath === "/" ? "/products" : basePath} />
          </div>
        </section>
      )}

      {categories.length > 0 && (showHero || isHome) && (
        <section className="mb-8 sm:mb-10">
          <SectionHeader title="Categories" href="/categories" className="mb-4" />
          <CategoryScroller categories={categories} />
        </section>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title={title}
          href={basePath !== "/products" ? "/products" : undefined}
        />
        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          className="self-start rounded-pill border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted lg:hidden"
        >
          {filterOpen ? "Hide filters" : "Filters"}
        </button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-12">
        <div
          className={`md:w-72 md:shrink-0 lg:w-64 ${
            filterOpen ? "block" : "hidden md:block"
          }`}
        >
          <ProductFilter categories={categories} />
        </div>

        <div className="min-w-0 flex-1">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
          />

          <div className="mt-10">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              basePath={basePath === "/" ? "/" : basePath}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
