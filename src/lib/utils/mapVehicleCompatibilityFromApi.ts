import type {
  ProductVehicleCompatibility,
  VehicleCompatibilityCatalog,
} from "@/types/vehicleCompatibility";

function str(value: unknown): string {
  return typeof value === "string" ? value : value != null ? String(value) : "";
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Map one global catalog entry from API JSON (snake_case or camelCase). */
export function mapVehicleCompatibilityCatalogFromApi(
  raw: unknown
): VehicleCompatibilityCatalog | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const id = v.id;
  if (id == null || id === "") return null;
  return {
    id: String(id),
    make: str(v.make),
    model: str(v.model),
    generation: str(v.generation),
    year_start: num(v.year_start ?? v.yearStart),
    year_end: num(v.year_end ?? v.yearEnd),
    engine: str(v.engine),
    trim: str(v.trim),
    market_variant: str(v.market_variant ?? v.marketVariant),
    notes: str(v.notes),
    created_at: str(v.created_at ?? v.createdAt),
    updated_at: str(v.updated_at ?? v.updatedAt),
  };
}

/** Map product-linked compatibility (catalog fields + link_notes). */
export function mapProductVehicleCompatibilityFromApi(
  raw: unknown
): ProductVehicleCompatibility | null {
  const catalog = mapVehicleCompatibilityCatalogFromApi(raw);
  if (!catalog) return null;
  const v = raw as Record<string, unknown>;
  return {
    ...catalog,
    link_notes: str(v.link_notes ?? v.linkNotes),
  };
}

export function mapVehicleCompatibilityCatalogListFromApi(
  raw: unknown
): VehicleCompatibilityCatalog[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(mapVehicleCompatibilityCatalogFromApi)
    .filter((v): v is VehicleCompatibilityCatalog => v != null);
}

export function mapProductVehicleCompatibilityListFromApi(
  raw: unknown
): ProductVehicleCompatibility[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(mapProductVehicleCompatibilityFromApi)
    .filter((v): v is ProductVehicleCompatibility => v != null);
}

export function formatCompatibilityYearRange(
  yearStart: number,
  yearEnd: number
): string {
  if (yearStart > 0 && yearEnd > 0) {
    if (yearStart === yearEnd) return String(yearStart);
    return `${yearStart}–${yearEnd}`;
  }
  if (yearStart > 0) return `${yearStart}+`;
  if (yearEnd > 0) return `Up to ${yearEnd}`;
  return "All years";
}

export function formatCompatibilityLabel(
  entry: Pick<
    VehicleCompatibilityCatalog,
    "make" | "model" | "generation" | "year_start" | "year_end" | "trim" | "engine" | "market_variant"
  >
): string {
  const years = formatCompatibilityYearRange(entry.year_start, entry.year_end);
  return [
    years,
    entry.make,
    entry.model,
    entry.generation,
    entry.trim,
    entry.engine,
    entry.market_variant,
  ]
    .filter((p) => p && String(p).trim())
    .join(" · ");
}
