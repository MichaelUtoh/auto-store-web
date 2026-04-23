"use client";

import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils/format";

export function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  return (
    <div className="rounded-lg border border-gray-200 bg-muted/30 p-4">
      <h3 className="font-semibold text-primary">Order summary</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between text-secondary"
          >
            <span className="line-clamp-1">
              {item.product?.name ?? "Item"} × {item.quantity}
            </span>
            <span className="text-primary">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex justify-between font-semibold text-primary">
          <span>Subtotal</span>
          <span>{formatPrice(getTotalPrice())}</span>
        </div>
      </div>
    </div>
  );
}
