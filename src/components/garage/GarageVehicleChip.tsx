"use client";

import { Car } from "lucide-react";
import { useGarageStore } from "@/store/useGarageStore";

export function GarageVehicleChip() {
  const vehicle = useGarageStore((s) => s.vehicle);
  if (!vehicle) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-pill bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
      <Car className="h-3.5 w-3.5" strokeWidth={1.5} />
      {vehicle.year} {vehicle.make} {vehicle.model}
    </span>
  );
}
