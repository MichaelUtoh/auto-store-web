"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGarageStore } from "@/store/useGarageStore";
import type { GarageVehicle } from "@/types/garage";

interface GarageVehiclePickerProps {
  onChange?: (vehicle: GarageVehicle | null) => void;
  showDemoFill?: boolean;
}

export function GarageVehiclePicker({
  onChange,
  showDemoFill = true,
}: GarageVehiclePickerProps) {
  const vehicle = useGarageStore((s) => s.vehicle);
  const setVehicle = useGarageStore((s) => s.setVehicle);

  const update = (patch: Partial<GarageVehicle>) => {
    const next = {
      make: patch.make ?? vehicle?.make ?? "",
      model: patch.model ?? vehicle?.model ?? "",
      year: patch.year ?? vehicle?.year ?? new Date().getFullYear(),
    };
    if (!next.make.trim() || !next.model.trim()) {
      setVehicle(null);
      onChange?.(null);
      return;
    }
    const v: GarageVehicle = {
      make: next.make.trim(),
      model: next.model.trim(),
      year: next.year,
    };
    setVehicle(v);
    onChange?.(v);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("make", v.make);
      params.set("model", v.model);
      params.set("year", String(v.year));
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    }
  };

  const fillDemo = () => {
    const demo: GarageVehicle = {
      make: "Toyota",
      model: "Camry",
      year: 2018,
    };
    setVehicle(demo);
    onChange?.(demo);
  };

  return (
    <div className="space-y-4 rounded-3xl bg-muted p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-foreground">Your vehicle</h2>
        {showDemoFill && (
          <Button type="button" variant="ghost" size="sm" onClick={fillDemo}>
            Demo: Camry 2018
          </Button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="garage-year">Year</Label>
          <Input
            id="garage-year"
            type="number"
            min={1980}
            max={2030}
            value={vehicle?.year ?? ""}
            onChange={(e) =>
              update({ year: parseInt(e.target.value, 10) || vehicle?.year })
            }
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="garage-make">Make</Label>
          <Input
            id="garage-make"
            value={vehicle?.make ?? ""}
            onChange={(e) => update({ make: e.target.value })}
            placeholder="Toyota"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="garage-model">Model</Label>
          <Input
            id="garage-model"
            value={vehicle?.model ?? ""}
            onChange={(e) => update({ model: e.target.value })}
            placeholder="Camry"
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
