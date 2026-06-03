"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { partFinderApi } from "@/lib/api/partFinder";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils/format";
import { isRemoteImageSrc } from "@/lib/utils/helpers";
import type { DiagramHotspot, PartFinderProductSummary } from "@/types/partFinder";
import type { GarageVehicle } from "@/types/partFinder";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface HotspotProductDrawerProps {
  open: boolean;
  onClose: () => void;
  diagramId: string;
  hotspot: DiagramHotspot | null;
  vehicle: GarageVehicle | null;
}

export function HotspotProductDrawer({
  open,
  onClose,
  diagramId,
  hotspot,
  vehicle,
}: HotspotProductDrawerProps) {
  const [products, setProducts] = useState<PartFinderProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!open || !hotspot) {
      setProducts([]);
      return;
    }
    setLoading(true);
    partFinderApi
      .getHotspotProducts(diagramId, hotspot.id, vehicle?.year)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [open, diagramId, hotspot, vehicle?.year]);

  const handleAddToCart = async (productId: string) => {
    try {
      await addItem(productId, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (!open) return null;

  const searchFallback =
    vehicle && hotspot?.oemPartNumber
      ? `/search?search=${encodeURIComponent(hotspot.oemPartNumber)}`
      : vehicle
        ? `/search?search=${encodeURIComponent(hotspot?.label ?? "")}`
        : "/search";

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-overlay/40 backdrop-blur-[2px] lg:hidden"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed z-50 flex flex-col bg-surface shadow-float",
          "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl",
          "lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-full lg:w-full lg:max-w-md lg:rounded-none lg:rounded-l-3xl"
        )}
        role="dialog"
        aria-label="Parts for selected component"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {hotspot?.label ?? "Component"}
            </h2>
            {hotspot?.oemPartNumber && (
              <p className="mt-1 text-xs text-secondary">
                OEM #{hotspot.oemPartNumber}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-center text-secondary py-8">Loading parts…</p>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-muted px-4 py-8 text-center">
              <p className="text-sm text-secondary">
                No exact match in stock — try search.
              </p>
              <Button asChild variant="outline" className="mt-4" size="sm">
                <Link href={searchFallback}>Search catalog</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex gap-4 rounded-2xl border border-border p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                    {p.primaryImageUrl ? (
                      <Image
                        src={p.primaryImageUrl}
                        alt=""
                        fill
                        className="object-contain p-1"
                        unoptimized={isRemoteImageSrc(p.primaryImageUrl)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-secondary">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground line-clamp-2">
                      {p.name}
                    </p>
                    <p className="mt-1 text-sm text-secondary">{p.brand}</p>
                    <p className="mt-1 text-base font-bold text-foreground">
                      {formatPrice(p.price)}
                    </p>
                    <p className="text-xs text-secondary">
                      {p.stockQuantity > 0
                        ? `${p.stockQuantity} in stock`
                        : "Out of stock"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={p.stockQuantity <= 0}
                        onClick={() => handleAddToCart(p.id)}
                      >
                        <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                        Add to cart
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${p.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
