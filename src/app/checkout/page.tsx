"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CartItem } from "@/components/cart/CartItem";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ordersApi } from "@/lib/api/orders";
import type { OrderAddress } from "@/types/order";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/checkout");
      return;
    }
    fetchCart();
  }, [hasHydrated, isAuthenticated, fetchCart, router]);

  useEffect(() => {
    if (isAuthenticated && items.length === 0 && !orderId) {
      const timer = setTimeout(() => fetchCart(), 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, items.length, orderId, fetchCart]);

  const handleSubmit = async (address: OrderAddress) => {
    setIsSubmitting(true);
    try {
      const res = await ordersApi.createOrder({ shippingAddress: address });
      const order = (res as { data?: { id: string } }).data ?? res;
      const id = (order as { id?: string }).id;
      if (id) {
        setOrderId(id);
        clearCart();
        router.push(`/account/orders/${id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasHydrated || !isAuthenticated) return null;

  if (items.length === 0 && !orderId) {
    return (
      <div className="page-container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-bold text-primary">Your cart is empty</h2>
        <Button asChild className="mt-6" size="lg">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container py-6 sm:py-8">
      <h1 className="page-title">Checkout</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-secondary">
            Shipping address
          </h2>
          <CheckoutForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-secondary">
            Order summary
          </h2>
          <div className="rounded-3xl bg-muted p-5">
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold text-primary">Subtotal</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
