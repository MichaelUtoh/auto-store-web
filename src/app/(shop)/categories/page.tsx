"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { productsApi } from "@/lib/api/products";
import type { Category } from "@/types/product";

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-primary">Categories</h1>
        <p className="mt-4 text-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">Categories</h1>
      <p className="mt-2 text-secondary">Browse by category.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug ?? cat.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h2 className="font-medium text-primary">{cat.name}</h2>
                {cat.productCount != null && (
                  <p className="mt-1 text-sm text-secondary">
                    {cat.productCount} products
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {categories.length === 0 && (
        <p className="mt-8 text-center text-secondary">No categories yet.</p>
      )}
    </div>
  );
}
