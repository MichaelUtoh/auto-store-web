"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="page-container py-6 sm:py-8">
      <nav className="mb-4 text-sm text-secondary">
        <Link href="/categories" className="hover:text-primary">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-primary">{category?.name ?? slug}</span>
      </nav>
      <h1 className="page-title">{category?.name ?? "Category"}</h1>
      <p className="mt-2 text-sm text-secondary sm:text-base">
        {category?.productCount != null
          ? `${category.productCount} products`
          : "Browse products in this category."}
      </p>
      <div className="mt-6 sm:mt-8">
        <ProductGrid
          products={products}
          isLoading={isLoading}
          emptyMessage="No products in this category yet."
        />
      </div>
    </div>
  );
}
