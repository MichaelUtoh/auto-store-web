"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import type { CartItem as CartItemType } from "@/types/cart";
import {
  isRemoteImageSrc,
  resolveProductImageSrc,
} from "@/lib/utils/helpers";
import { useCartStore } from "@/store/useCartStore";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const imageSrc = resolveProductImageSrc(item.product?.images?.[0]);

  return (
    <div className="flex gap-4 border-b border-border py-4 last:border-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-24 sm:w-24">
        <Image
          src={imageSrc}
          alt={item.product?.name ?? "Product"}
          fill
          unoptimized={isRemoteImageSrc(imageSrc)}
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-primary">
          {item.product?.name ?? "Product"}
        </p>
        <p className="mt-1 text-xs text-secondary">
          {formatPrice(item.price)} each
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center rounded-pill bg-muted px-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[2rem] text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-error hover:bg-error/10"
            onClick={() => removeItem(item.id)}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="shrink-0 text-right text-sm font-bold text-primary">
        {formatPrice(item.price * item.quantity)}
      </div>
    </div>
  );
}
