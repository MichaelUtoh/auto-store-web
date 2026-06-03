"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { useGarageStore } from "@/store/useGarageStore";

export function GarageVehicleChip() {
  const vehicle = useGarageStore((s) => s.vehicle);
  if (!vehicle) return null;

  const qs = new URLSearchParams({
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
  });

  return (
    <Link
      href={`/parts?${qs.toString()}`}
      className="inline-flex items-center gap-2 rounded-pill bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80"
    >
      <Car className="h-3.5 w-3.5" strokeWidth={1.5} />
      {vehicle.year} {vehicle.make} {vehicle.model}
    </Link>
  );
}
