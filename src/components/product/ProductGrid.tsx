"use client";

import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
      </div>
      <div className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  isLoading,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-8 text-center text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
