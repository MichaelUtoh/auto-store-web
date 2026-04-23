"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  isRemoteImageSrc,
  normalizeProductImages,
} from "@/lib/utils/helpers";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  const images = normalizeProductImages(product.images);

  const mainSrc = images[activeImage] ?? images[0];

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, quantity);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-muted">
          <Image
            src={mainSrc}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized={isRemoteImageSrc(mainSrc)}
            className="object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded border-2 transition-colors",
                  activeImage === i ? "border-accent" : "border-gray-200"
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized={isRemoteImageSrc(src)}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-primary">{product.name}</h1>
        {product.sku && (
          <p className="mt-1 text-sm text-secondary">SKU: {product.sku}</p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice != null && product.compareAtPrice > product.price && (
            <span className="text-lg text-secondary line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-6 text-secondary">{product.description}</p>
        )}

        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-primary">Specifications</h3>
            <table className="mt-2 w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-2 text-secondary">{key}</td>
                    <td className="py-2 text-primary">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="qty" className="text-sm font-medium text-primary">
              Quantity
            </label>
            <input
              id="qty"
              type="number"
              min={1}
              max={product.stock ?? 99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-20 rounded border border-gray-200 px-3 py-2 text-center"
            />
          </div>
          <Button onClick={handleAddToCart} className="min-w-[140px]">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to cart
          </Button>
          <Button variant="outline" size="icon" aria-label="Add to wishlist">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
