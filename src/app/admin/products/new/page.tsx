"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { productsApi } from "@/lib/api/products";
import type { CreateProductPayload } from "@/types/product";
import type { Category } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateProductPayload>({
    name: "",
    slug: "",
    description: "",
    price: 0 as number,
    compareAtPrice: undefined,
    images: [],
    categoryId: "",
    sku: "",
    stock: undefined,
  });

  useEffect(() => {
    productsApi.getCategories().then((res) => {
      const data = (res as { data?: Category[] }).data ?? res;
      setCategories(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) {
      toast.error("Name and category are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateProductPayload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug?.trim() || slugFromName(form.name),
        price: Number(form.price) || 0,
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : undefined,
        stock: form.stock != null ? Number(form.stock) : undefined,
        images: [],
      };
      const product = await productsApi.createProduct(payload);
      toast.success("Product created.");
      router.push(`/admin/products/${product.id}/edit`);
    } catch {
      toast.error("Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary">Add product</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                name: e.target.value,
                slug: prev.slug || slugFromName(e.target.value),
              }))
            }
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            className="mt-1"
            placeholder="Auto-generated from name"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            className="mt-1 flex min-h-[100px] w-full rounded-md border border-gray-200 bg-surface px-3 py-2 text-sm"
            rows={4}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={0.01}
              value={form.price || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value) || 0,
                }))
              }
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="compareAtPrice">Compare at price</Label>
            <Input
              id="compareAtPrice"
              type="number"
              min={0}
              step={0.01}
              value={form.compareAtPrice ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="categoryId">Category *</Label>
          <select
            id="categoryId"
            value={form.categoryId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-gray-200 bg-surface px-3 py-2 text-sm"
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={form.stock ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  stock: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label>Product images</Label>
          <p className="mt-1 text-sm text-secondary">
            After creating the product, you can add images on the edit page.
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create product"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
