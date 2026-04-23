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
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-primary">Your cart is empty</h2>
        <Button asChild className="mt-4">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">Checkout</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-medium text-primary">Shipping address</h2>
          <CheckoutForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
        <div>
          <h2 className="mb-4 font-medium text-primary">Order summary</h2>
          <div className="rounded-lg border border-gray-200 bg-muted/30 p-4">
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-semibold text-primary">
                <span>Subtotal</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
