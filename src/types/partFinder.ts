export interface GarageVehicle {
  make: string;
  model: string;
  year: number;
}

export interface VehicleSystem {
  id: string;
  code: string;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface DiagramListItem {
  id: string;
  title: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  imageUrl: string;
  vehicleSystem: VehicleSystem;
}

export interface DiagramHotspot {
  id: string;
  diagramId: string;
  label: string;
  oemPartNumber?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  displayOrder: number;
}

export interface DiagramDetail extends DiagramListItem {
  svgOverlayUrl?: string;
  imageWidth: number;
  imageHeight: number;
  hotspots: DiagramHotspot[];
}

export interface PartFinderProductSummary {
  id: string;
  sku: string;
  name: string;
  brand: string;
  manufacturerPartNumber: string;
  price: number;
  condition: string;
  stockQuantity: number;
  primaryImageUrl?: string;
  installationEligible?: boolean;
}

export interface PartIdentificationCandidate {
  partName: string;
  confidence: number;
  hotspotId?: string;
  diagramId?: string;
  productIds: string[];
}

export interface PartIdentificationResult {
  id: string;
  imageUrl: string;
  diagramId?: string;
  candidates: PartIdentificationCandidate[];
}

export interface ListDiagramsParams {
  make: string;
  model: string;
  year: number;
  system?: string;
  page?: number;
  limit?: number;
}

export interface DiagramsListResult {
  items: DiagramListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
