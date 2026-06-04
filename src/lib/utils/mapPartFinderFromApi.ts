import type {
  DiagramDetail,
  DiagramHotspot,
  DiagramListItem,
  DiagramsListResult,
  PartFinderProductSummary,
  PartIdentificationCandidate,
  PartIdentificationResult,
  VehicleSystem,
} from "@/types/partFinder";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

function mapVehicleSystem(raw: unknown): VehicleSystem {
  const s = raw as Record<string, unknown>;
  return {
    id: String(s.id ?? ""),
    code: String(s.code ?? ""),
    name: String(s.name ?? s.code ?? ""),
    description: s.description as string | undefined,
    displayOrder: Number(s.display_order ?? s.displayOrder ?? 0),
  };
}

export function mapDiagramListItemFromApi(raw: unknown): DiagramListItem {
  const d = raw as Record<string, unknown>;
  const vs = d.vehicle_system ?? d.vehicleSystem;
  return {
    id: String(d.id ?? ""),
    title: String(d.title ?? ""),
    make: String(d.make ?? ""),
    model: String(d.model ?? ""),
    yearStart: Number(d.year_start ?? d.yearStart ?? 0),
    yearEnd: Number(d.year_end ?? d.yearEnd ?? 0),
    imageUrl: String(d.image_url ?? d.imageUrl ?? ""),
    vehicleSystem: mapVehicleSystem(vs),
  };
}

export function mapDiagramHotspotFromApi(raw: unknown): DiagramHotspot {
  const h = raw as Record<string, unknown>;
  return {
    id: String(h.id ?? ""),
    diagramId: String(h.diagram_id ?? h.diagramId ?? ""),
    label: String(h.label ?? ""),
    oemPartNumber: (h.oem_part_number ?? h.oemPartNumber) as string | undefined,
    x: Number(h.x ?? 0),
    y: Number(h.y ?? 0),
    width: Number(h.width ?? 0),
    height: Number(h.height ?? 0),
    displayOrder: Number(h.display_order ?? h.displayOrder ?? 0),
  };
}

export function mapDiagramDetailFromApi(raw: unknown): DiagramDetail {
  const body = unwrapApiDataBody(raw) ?? raw;
  const d = body as Record<string, unknown>;
  const base = mapDiagramListItemFromApi(d);
  const hotspotsRaw = d.hotspots;
  const hotspots = Array.isArray(hotspotsRaw)
    ? hotspotsRaw.map(mapDiagramHotspotFromApi)
    : [];
  return {
    ...base,
    svgOverlayUrl: (d.svg_overlay_url ?? d.svgOverlayUrl) as string | undefined,
    imageWidth: Number(d.image_width ?? d.imageWidth ?? 0),
    imageHeight: Number(d.image_height ?? d.imageHeight ?? 0),
    hotspots,
  };
}

export function parseDiagramsListResponse(body: unknown): DiagramsListResult {
  const unwrapped = unwrapApiDataBody(body);
  const root = (body ?? {}) as Record<string, unknown>;
  const meta = (root.meta ?? {}) as Record<string, unknown>;

  let items: unknown[] = [];
  if (Array.isArray(unwrapped)) items = unwrapped;
  else if (unwrapped && typeof unwrapped === "object") {
    const o = unwrapped as Record<string, unknown>;
    if (Array.isArray(o.data)) items = o.data;
    else if (Array.isArray(o.items)) items = o.items;
  }

  const page = Number(meta.page ?? 1);
  const limit = Number(meta.limit ?? 20);
  const total = Number(meta.total ?? items.length);
  const totalPages = Number(
    meta.total_pages ??
      meta.totalPages ??
      (Math.ceil(total / limit) || 1)
  );

  return {
    items: items.map(mapDiagramListItemFromApi),
    page,
    limit,
    total,
    totalPages,
  };
}

export function mapVehicleSystemsFromApi(body: unknown): VehicleSystem[] {
  const unwrapped = unwrapApiDataBody(body);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray((unwrapped as { data?: unknown[] })?.data)
      ? (unwrapped as { data: unknown[] }).data
      : [];
  return list.map(mapVehicleSystem).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function mapHotspotProductsFromApi(body: unknown): PartFinderProductSummary[] {
  const unwrapped = unwrapApiDataBody(body);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray((unwrapped as { data?: unknown[] })?.data)
      ? (unwrapped as { data: unknown[] }).data
      : [];
  return list.map((raw) => {
    const p = raw as Record<string, unknown>;
    return {
      id: String(p.id ?? ""),
      sku: String(p.sku ?? ""),
      name: String(p.name ?? ""),
      brand: String(p.brand ?? ""),
      manufacturerPartNumber: String(
        p.manufacturer_part_number ?? p.manufacturerPartNumber ?? ""
      ),
      price: Number(p.price ?? 0),
      condition: String(p.condition ?? ""),
      stockQuantity: Number(p.stock_quantity ?? p.stockQuantity ?? 0),
      primaryImageUrl: (p.primary_image_url ??
        p.primaryImageUrl) as string | undefined,
      installationEligible: Boolean(
        p.installation_eligible ?? p.installationEligible
      ),
    };
  });
}

export function mapPartIdentificationFromApi(
  raw: unknown
): PartIdentificationResult {
  const unwrapped = unwrapApiDataBody(raw);
  const d = (unwrapped ?? raw) as Record<string, unknown>;
  if (!d || typeof d !== "object") {
    return { id: "", imageUrl: "", candidates: [] };
  }
  const candidatesRaw = d.candidates;
  const candidates: PartIdentificationCandidate[] = Array.isArray(candidatesRaw)
    ? candidatesRaw.map((c) => {
        const x = c as Record<string, unknown>;
        const productIds = x.product_ids ?? x.productIds;
        return {
          partName: String(x.part_name ?? x.partName ?? ""),
          confidence: Number(x.confidence ?? 0),
          hotspotId: (x.hotspot_id ?? x.hotspotId) as string | undefined,
          diagramId: (x.diagram_id ?? x.diagramId) as string | undefined,
          productIds: Array.isArray(productIds)
            ? productIds.map(String)
            : [],
        };
      })
    : [];
  return {
    id: String(d.id ?? ""),
    imageUrl: String(d.image_url ?? d.imageUrl ?? ""),
    diagramId: (d.diagram_id ?? d.diagramId) as string | undefined,
    candidates,
  };
}
