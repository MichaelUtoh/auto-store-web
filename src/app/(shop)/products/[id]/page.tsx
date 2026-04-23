"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGrid } from "@/components/product/ProductGrid";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { productsApi } from "@/lib/api/products";
import type { Product } from "@/types/product";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsApi
      .getProduct(id)
      .then((res) => {
        const data = (res as { data?: Product }).data ?? res;
        setProduct(data as Product);
        if (data && (data as Product).categoryId) {
          return productsApi.getProducts({
            category: (data as Product).categoryId,
            limit: 4,
          });
        }
      })
      .then((res) => {
        if (res) {
          const list = (res as { data?: { data?: Product[] } }).data?.data ?? (Array.isArray(res) ? res : []);
          setRelated(Array.isArray(list) ? list : []);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-primary">Product not found</h2>
        <Link href="/products" className="mt-4 inline-block text-accent hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-secondary">
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-primary">{product.name}</span>
      </nav>
      <ProductDetails product={product} />
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-primary">Related products</h2>
          <div className="mt-4">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
