/** Global vehicle compatibility catalog entry (UUID, no product_id). */
export interface VehicleCompatibilityCatalog {
  id: string;
  make: string;
  model: string;
  generation: string;
  year_start: number;
  year_end: number;
  engine: string;
  trim: string;
  market_variant: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

/** Linked fitment row from GET /products/:id/compatibility. */
export interface ProductVehicleCompatibility extends VehicleCompatibilityCatalog {
  link_notes: string;
}

export interface VehicleCompatibilityCreateInput {
  make: string;
  model: string;
  generation?: string;
  year_start: number;
  year_end: number;
  engine?: string;
  trim?: string;
  market_variant?: string;
  notes?: string;
}

export interface VehicleCompatibilityListParams {
  make?: string;
  model?: string;
  market_variant?: string;
  page?: number;
  limit?: number;
}

export interface LinkProductCompatibilitiesPayload {
  compatibility_ids?: string[];
  compatibilities?: VehicleCompatibilityCreateInput[];
}
