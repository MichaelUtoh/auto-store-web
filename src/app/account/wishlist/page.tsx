"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api/users";
import { productsApi } from "@/lib/api/products";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .getWishlist()
      .then((res) => {
        const data = (res as { data?: string[] }).data ?? res;
        const ids = Array.isArray(data) ? data : [];
        setProductIds(ids);
        if (ids.length === 0) return [];
        return Promise.all(ids.map((id) => productsApi.getProduct(id)));
      })
      .then((results) => {
        if (results && results.length > 0) {
          const list = results
            .map((r) => ((r as { data?: Product }).data ?? r) as Product)
            .filter(Boolean);
          setProducts(list);
        }
      })
      .catch(() => setProductIds([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-secondary">
          Loading…
        </CardContent>
      </Card>
    );
  }

  if (productIds.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-secondary">
          <p>Your wishlist is empty.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <ProductGrid
        products={products}
        isLoading={false}
        emptyMessage="Wishlist items could not be loaded."
      />
    </div>
  );
}
