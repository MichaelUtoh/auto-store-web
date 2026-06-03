import type { Category } from "@/types/product";

const SLUG_TO_SYSTEM: Record<string, string> = {
  brakes: "brakes",
  brake: "brakes",
  suspension: "suspension",
  engine: "engine",
  exhaust: "exhaust",
  cooling: "cooling",
  electrical: "electrical",
  transmission: "transmission",
  "drive-train": "drivetrain",
  drivetrain: "drivetrain",
};

/** Infer vehicle system code from product category slug/name. */
export function inferSystemFromCategories(
  category?: Category | null
): string | undefined {
  if (!category) return undefined;
  const slug = category.slug?.toLowerCase() ?? "";
  const name = category.name?.toLowerCase() ?? "";
  for (const [key, code] of Object.entries(SLUG_TO_SYSTEM)) {
    if (slug.includes(key) || name.includes(key)) return code;
  }
  return undefined;
}
