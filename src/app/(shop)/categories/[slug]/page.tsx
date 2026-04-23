"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useProductStore } from "@/store/useProductStore";
import { productsApi } from "@/lib/api/products";
import type { Category } from "@/types/product";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<Category | null>(null);
  const { products, pagination, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!slug) return;
    productsApi
      .getCategoryBySlug(slug)
      .then((res) => {
        const data = (res as { data?: Category }).data ?? res;
        setCategory(data as Category);
      })
      .catch(() => setCategory(null));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const page = 1;
    fetchProducts({ category: slug, page, limit: ITEMS_PER_PAGE });
  }, [slug, fetchProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">
        {category?.name ?? "Category"}
      </h1>
      <p className="mt-2 text-secondary">
        {category?.productCount != null
          ? `${category.productCount} products`
          : "Browse products in this category."}
      </p>
      <div className="mt-6">
        <ProductGrid
          products={products}
          isLoading={isLoading}
          emptyMessage="No products in this category yet."
        />
      </div>
    </div>
  );
}
