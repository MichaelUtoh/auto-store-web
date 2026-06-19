"use client";

import type { ProductVehicleCompatibility } from "@/types/vehicleCompatibility";
import {
  formatCompatibilityYearRange,
} from "@/lib/utils/mapVehicleCompatibilityFromApi";

interface VehicleCompatibilityTableProps {
  items: ProductVehicleCompatibility[];
  showLinkNotes?: boolean;
  emptyMessage?: string;
}

export function VehicleCompatibilityTable({
  items,
  showLinkNotes = true,
  emptyMessage = "No vehicle fitment data listed.",
}: VehicleCompatibilityTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-secondary">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-secondary">
            <th className="py-2 pr-4 font-medium">Make</th>
            <th className="py-2 pr-4 font-medium">Model</th>
            <th className="py-2 pr-4 font-medium">Generation</th>
            <th className="py-2 pr-4 font-medium">Years</th>
            <th className="py-2 pr-4 font-medium">Engine</th>
            <th className="py-2 pr-4 font-medium">Trim</th>
            <th className="py-2 pr-4 font-medium">Market</th>
            {showLinkNotes && (
              <th className="py-2 pr-4 font-medium">Link notes</th>
            )}
            <th className="py-2 font-medium">Catalog notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/60 last:border-0">
              <td className="py-2.5 pr-4 text-primary">{item.make}</td>
              <td className="py-2.5 pr-4 text-primary">{item.model}</td>
              <td className="py-2.5 pr-4 text-secondary">
                {item.generation || "—"}
              </td>
              <td className="py-2.5 pr-4 text-primary">
                {formatCompatibilityYearRange(item.year_start, item.year_end)}
              </td>
              <td className="py-2.5 pr-4 text-secondary">
                {item.engine || "—"}
              </td>
              <td className="py-2.5 pr-4 text-secondary">
                {item.trim || "—"}
              </td>
              <td className="py-2.5 pr-4 text-secondary">
                {item.market_variant || "—"}
              </td>
              {showLinkNotes && (
                <td className="py-2.5 pr-4 text-secondary">
                  {item.link_notes || "—"}
                </td>
              )}
              <td className="py-2.5 text-secondary">{item.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
