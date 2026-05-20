"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/store/useCartStore";

interface CartSummaryProps {
  onCheckout?: () => void;
  showCheckoutButton?: boolean;
}

export function CartSummary({
  onCheckout,
  showCheckoutButton = true,
}: CartSummaryProps) {
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const total = getTotalPrice();

  return (
    <div className="rounded-3xl bg-muted p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-secondary">Subtotal</span>
        <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
      </div>
      <p className="mt-1 text-xs text-secondary">
        Shipping and tax calculated at checkout.
      </p>
      {showCheckoutButton && (
        <div className="mt-4 space-y-2">
          <Button className="w-full" size="lg" asChild onClick={onCheckout}>
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button variant="link" className="w-full" asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
