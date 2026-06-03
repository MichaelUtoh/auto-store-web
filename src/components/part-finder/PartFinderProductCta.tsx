"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { partFinderApi } from "@/lib/api/partFinder";
import { useGarageStore } from "@/store/useGarageStore";
import { inferSystemFromCategories } from "@/lib/part-finder/inferSystem";
import type { Product } from "@/types/product";

export function PartFinderProductCta({ product }: { product: Product }) {
  const vehicle = useGarageStore((s) => s.vehicle);
  const [diagramId, setDiagramId] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicle) {
      setDiagramId(null);
      return;
    }
    const system = inferSystemFromCategories(product.category);
    if (!system) {
      setDiagramId(null);
      return;
    }
    partFinderApi
      .listDiagrams({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        system,
        limit: 1,
      })
      .then((res) => {
        setDiagramId(res.items[0]?.id ?? null);
      })
      .catch(() => setDiagramId(null));
  }, [vehicle, product.category]);

  if (!vehicle || !diagramId) return null;

  const qs = new URLSearchParams({
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    diagramId,
    system: inferSystemFromCategories(product.category) ?? "brakes",
  });

  if (product.sku) {
    qs.set("q", product.sku);
  }

  return (
    <div className="mt-6 rounded-3xl border border-border bg-muted/40 p-4">
      <p className="text-sm font-semibold text-foreground">
        See where this fits on your vehicle
      </p>
      <p className="mt-1 text-xs text-secondary">
        Interactive diagram for your {vehicle.year} {vehicle.make} {vehicle.model}
      </p>
      <Button asChild variant="outline" size="sm" className="mt-3">
        <Link href={`/parts?${qs.toString()}`}>
          <Map className="mr-2 h-4 w-4" />
          Find on diagram
        </Link>
      </Button>
    </div>
  );
}
