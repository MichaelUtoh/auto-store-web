"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  isRemoteImageSrc,
  resolveProductCardImage,
} from "@/lib/utils/helpers";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const imageSrc = resolveProductCardImage(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product.id, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const onSale =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white shadow-card">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={isRemoteImageSrc(imageSrc)}
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02] sm:p-4"
          />
        </Link>
        {onSale && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-pill bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            Sale
          </span>
        )}
        <Button
          size="icon"
          className="absolute bottom-3 right-3 h-10 w-10 shadow-float"
          onClick={handleAddToCart}
          type="button"
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
        </Button>
      </div>
      <Link href={`/products/${product.id}`} className="mt-3 block space-y-1 px-0.5">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-primary">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-xs text-secondary line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
