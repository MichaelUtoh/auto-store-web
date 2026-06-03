"use client";

import { CircleDot, Cog, Wind, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VehicleSystem } from "@/types/partFinder";

const ICONS: Record<string, typeof CircleDot> = {
  brakes: CircleDot,
  suspension: Wind,
  engine: Cog,
  electrical: Zap,
};

interface SystemChipsProps {
  systems: VehicleSystem[];
  selected?: string;
  onSelect: (code: string) => void;
}

export function SystemChips({ systems, selected, onSelect }: SystemChipsProps) {
  if (systems.length === 0) {
    return (
      <p className="text-sm text-secondary">Loading systems…</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {systems.map((sys) => {
        const Icon = ICONS[sys.code] ?? CircleDot;
        const active = selected === sys.code;
        return (
          <button
            key={sys.id}
            type="button"
            onClick={() => onSelect(sys.code)}
            className={cn(
              "inline-flex items-center gap-2 rounded-pill px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {sys.name}
          </button>
        );
      })}
    </div>
  );
}
