"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productsApi } from "@/lib/api/products";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getProducts({ limit: 100 })
      .then((res) => {
        const body = res as { data?: Product[] | { data: Product[] } };
        const data = body.data ?? res;
        const list = Array.isArray(data)
          ? data
          : (data as { data?: Product[] })?.data ?? [];
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-primary">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="mt-6 text-secondary">Loading…</p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-secondary">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-muted/50">
                <th className="px-4 py-3 font-medium text-primary">Name</th>
                <th className="px-4 py-3 font-medium text-primary">SKU</th>
                <th className="px-4 py-3 font-medium text-primary">Price</th>
                <th className="px-4 py-3 font-medium text-primary">Category</th>
                <th className="px-4 py-3 font-medium text-primary">Stock</th>
                <th className="px-4 py-3 font-medium text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-primary">{p.name}</td>
                  <td className="px-4 py-3 text-secondary">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-primary">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {p.category?.name ?? p.categoryId ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {p.stock ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
