"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">Shopping cart</h1>
      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-secondary">Your cart is empty.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-surface p-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}
