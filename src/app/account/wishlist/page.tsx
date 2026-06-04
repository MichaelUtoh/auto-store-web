"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function WishlistPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const products = useWishlistStore((s) => s.products);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  if (isLoading && products.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-secondary">
          Loading…
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
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

  const withNames = products.filter((p) => p.name);

  return (
    <div>
      <ProductGrid
        products={withNames.length > 0 ? withNames : products}
        isLoading={false}
        showWishlistActions
        emptyMessage="Wishlist items could not be loaded."
      />
    </div>
  );
}
