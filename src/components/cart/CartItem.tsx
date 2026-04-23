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
    <div className="flex gap-4 border-b border-gray-200 py-4 last:border-0">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded border border-gray-200 bg-muted">
        <Image
          src={imageSrc}
          alt={item.product?.name ?? "Product"}
          fill
          unoptimized={isRemoteImageSrc(imageSrc)}
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-primary line-clamp-2">
          {item.product?.name ?? "Product"}
        </p>
        <p className="mt-1 text-sm text-secondary">
          {formatPrice(item.price)} × {item.quantity}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center rounded border border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-[2rem] text-center text-sm">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
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
      <div className="shrink-0 text-right font-medium text-primary">
        {formatPrice(item.price * item.quantity)}
      </div>
    </div>
  );
}
