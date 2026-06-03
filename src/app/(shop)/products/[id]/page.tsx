"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductQuestionsSection } from "@/components/qa/ProductQuestionsSection";
import { PartFinderProductCta } from "@/components/part-finder/PartFinderProductCta";
import { GarageVehicleChip } from "@/components/garage/GarageVehicleChip";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/layout/SectionHeader";
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
      <div className="page-container flex min-h-[50vh] items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container py-16 text-center">
        <h2 className="text-xl font-bold text-primary">Product not found</h2>
        <Link
          href="/products"
          className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-6 sm:py-8">
      <nav className="mb-6 text-sm text-secondary">
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-primary">{product.name}</span>
      </nav>
      <div className="mb-4">
        <GarageVehicleChip />
      </div>
      <ProductDetails product={product} />
      <PartFinderProductCta product={product} />
      <ProductQuestionsSection productId={product.id} />
      {related.length > 0 && (
        <section className="mt-14 sm:mt-16">
          <SectionHeader title="You may also like" className="mb-6" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
