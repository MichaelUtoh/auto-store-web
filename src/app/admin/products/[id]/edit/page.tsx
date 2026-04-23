"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { productsApi } from "@/lib/api/products";
import type {
  Product,
  Category,
  AdminEditProductForm,
} from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminProductImageUpload } from "@/components/admin/AdminProductImageUpload";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { productImagesToFormRows } from "@/lib/utils/helpers";
import toast from "react-hot-toast";

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

type BackendCategoryNode = Category & {
  children?: BackendCategoryNode[];
};

type ProductWithCategoryArray = Product & {
  categories?: Array<{ id?: string }>;
};

function flattenCategoryTree(nodes: BackendCategoryNode[]): Category[] {
  return nodes.flatMap((node) => {
    const { children, ...category } = node;
    return [category, ...flattenCategoryTree(children ?? [])];
  });
}

function getInitialCategoryId(product: ProductWithCategoryArray): string {
  if (product.categoryId) return product.categoryId;
  return product.categories?.[0]?.id ?? "";
}

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AdminEditProductForm | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      productsApi.getProduct(id),
      productsApi.getCategories(),
    ])
      .then(([productRes, categoriesRes]) => {
        const p = (productRes as { data?: Product }).data ?? productRes;
        const prod = p as ProductWithCategoryArray;
        setProduct(prod);
        setForm({
          name: prod.name,
          slug: prod.slug?.trim() || slugFromName(prod.name),
          description: prod.description ?? "",
          price: prod.price,
          compareAtPrice: prod.compareAtPrice,
          images: productImagesToFormRows(prod.images),
          categoryId: getInitialCategoryId(prod),
          sku: prod.sku ?? "",
          stock: prod.stock,
          tags: prod.tags,
          specs: prod.specs,
        });
        const catData =
          (categoriesRes as { data?: BackendCategoryNode[] }).data ?? categoriesRes;
        const list = Array.isArray(catData) ? flattenCategoryTree(catData) : [];
        setCategories(list);
      })
      .catch(() => {
        setProduct(null);
        toast.error("Product not found.");
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !product) return;
    if (!form.name.trim() || !form.categoryId) {
      toast.error("Name and category are required.");
      return;
    }
    if (form.images.length === 0) {
      toast.error("Add at least one image.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug?.trim() || slugFromName(form.name),
        price: Number(form.price) || 0,
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : undefined,
        stock:
          form.stock != null ? Number(form.stock) : undefined,
        images: form.images.map((row) => row.url),
      };
      await productsApi.updateProduct(product.id, payload);
      toast.success("Product updated.");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (product === null || form === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary">Edit product</h1>
      <p className="mt-1 text-sm text-secondary">{product.name}</p>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      name: e.target.value,
                      slug: prev.slug || slugFromName(e.target.value),
                    }
                  : null
              )
            }
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug ?? ""}
            onChange={(e) =>
              setForm((prev) => (prev ? { ...prev, slug: e.target.value } : null))
            }
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, description: e.target.value } : null
              )
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
              value={form.price ?? ""}
              onChange={(e) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, price: parseFloat(e.target.value) || 0 }
                    : null
                )
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
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        compareAtPrice: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }
                    : null
                )
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
              setForm((prev) =>
                prev ? { ...prev, categoryId: e.target.value } : null
              )
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
              onChange={(e) =>
                setForm((prev) =>
                  prev ? { ...prev, sku: e.target.value } : null
                )
              }
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
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        stock: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }
                    : null
                )
              }
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label>Product images *</Label>
          <p className="mt-1 text-sm text-secondary">
            Reorder or remove images; add new ones below.
          </p>
          <div className="mt-2">
            <AdminProductImageUpload
              productId={product.id}
              value={form.images}
              onChange={(rows) =>
                setForm((prev) => (prev ? { ...prev, images: rows } : null))
              }
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
