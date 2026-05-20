"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
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

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left font-semibold text-primary"
      >
        {title}
        <span className="text-xl font-light text-secondary">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pb-4 text-sm leading-relaxed text-secondary">{children}</div>}
    </div>
  );
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  const images = normalizeProductImages(product.images);
  const mainSrc = images[activeImage] ?? images[0];
  const lineTotal = product.price * quantity;

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, quantity);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <>
      <div className="grid gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted shadow-card">
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
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl transition-all",
                    activeImage === i
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-70 hover:opacity-100"
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

        <div className="pb-28 lg:pb-0">
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {product.name}
          </h1>
          {product.sku && (
            <p className="mt-2 text-sm text-secondary">SKU: {product.sku}</p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-primary sm:text-3xl">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice != null &&
              product.compareAtPrice > product.price && (
                <span className="text-lg text-secondary line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-semibold text-primary">Quantity</span>
            <div className="flex items-center rounded-pill bg-muted px-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[2.5rem] text-center text-sm font-semibold">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(product.stock ?? 99, q + 1)
                  )
                }
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-8 space-y-0">
            {product.description && (
              <AccordionSection title="Product details" defaultOpen>
                <p>{product.description}</p>
              </AccordionSection>
            )}

            {product.specs && Object.keys(product.specs).length > 0 && (
              <AccordionSection title="Specifications">
                <dl className="space-y-2">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0"
                    >
                      <dt className="text-secondary">{key}</dt>
                      <dd className="font-medium text-primary">{value}</dd>
                    </div>
                  ))}
                </dl>
              </AccordionSection>
            )}
          </div>

          <div className="mt-8 hidden lg:block">
            <Button size="lg" className="w-full sm:w-auto" onClick={handleAddToCart}>
              Add to cart — {formatPrice(lineTotal)}
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-secondary">Total</p>
            <p className="text-lg font-bold text-primary">{formatPrice(lineTotal)}</p>
          </div>
          <Button size="lg" className="flex-1" onClick={handleAddToCart}>
            Add to cart
          </Button>
        </div>
      </div>
    </>
  );
}
