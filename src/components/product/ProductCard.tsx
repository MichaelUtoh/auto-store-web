"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      <Link href={`/products/${product.id}`} className="block flex-1">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized={isRemoteImageSrc(imageSrc)}
            className="object-cover transition-transform group-hover:scale-105"
          />
          {product.compareAtPrice != null && product.compareAtPrice > product.price && (
            <span className="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 text-xs text-white">
              Sale
            </span>
          )}
        </div>
        <CardContent className="flex-1 p-4">
          <h3 className="font-medium text-primary line-clamp-2">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <span className="text-sm text-secondary line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="mt-auto p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          type="button"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
