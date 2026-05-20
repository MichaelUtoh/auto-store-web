"use client";

import { formatPrice } from "@/lib/utils/format";

interface OrderSummaryProps {
  subtotal: number;
  className?: string;
}

export function OrderSummary({ subtotal, className }: OrderSummaryProps) {
  return (
    <div className={`rounded-3xl bg-muted p-5 ${className ?? ""}`}>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-secondary">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-secondary">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
      </div>
      <div className="mt-4 flex justify-between border-t border-border pt-4">
        <span className="font-semibold text-primary">Total</span>
        <span className="text-lg font-bold text-primary">{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
