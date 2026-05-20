"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productsApi } from "@/lib/api/products";
import type { Category } from "@/types/product";
import { Wrench, Car, Gauge, Settings, Package, Layers } from "lucide-react";
const iconPool = [Wrench, Car, Gauge, Settings, Package, Layers];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getCategories()
      .then((res) => {
        const data = (res as { data?: Category[] }).data ?? res;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container py-6 sm:py-8">
        <h1 className="page-title">Categories</h1>
        <p className="mt-4 text-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page-container py-6 sm:py-8">
      <h1 className="page-title">Categories</h1>
      <p className="mt-2 text-sm text-secondary sm:text-base">
        Browse parts by category.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {categories.map((cat, i) => {
          const Icon = iconPool[i % iconPool.length];
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug ?? cat.id}`}
              className="group flex flex-col items-center rounded-3xl bg-muted p-6 transition-colors hover:bg-muted/80 sm:p-8"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-card transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
                <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="mt-4 text-center text-sm font-semibold text-primary sm:text-base">
                {cat.name}
              </h2>
              {cat.productCount != null && (
                <p className="mt-1 text-xs text-secondary">
                  {cat.productCount} products
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {categories.length === 0 && (
        <p className="mt-12 text-center text-secondary">No categories yet.</p>
      )}
    </div>
  );
}
