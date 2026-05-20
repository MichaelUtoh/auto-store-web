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
    <div className="page-container py-6 sm:py-8">
      <h1 className="page-title">Shopping cart</h1>
      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-muted py-20 text-center">
          <p className="text-secondary">Your cart is empty.</p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 md:grid-cols-3 md:gap-10">
          <div className="md:col-span-2">
            <div className="rounded-3xl bg-muted px-4 sm:px-5">
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
