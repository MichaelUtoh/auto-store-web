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
    <div className="rounded-lg border border-gray-200 bg-muted/30 p-4">
      <div className="flex items-center justify-between text-lg font-semibold text-primary">
        <span>Subtotal</span>
        <span>{formatPrice(total)}</span>
      </div>
      <p className="mt-1 text-sm text-secondary">
        Shipping and tax calculated at checkout.
      </p>
      {showCheckoutButton && (
        <div className="mt-4 space-y-2">
          <Button className="w-full" asChild onClick={onCheckout}>
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
