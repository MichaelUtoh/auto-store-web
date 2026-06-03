import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  DiagramDetail,
  DiagramsListResult,
  ListDiagramsParams,
  PartFinderProductSummary,
  PartIdentificationResult,
  VehicleSystem,
} from "@/types/partFinder";
import {
  mapDiagramDetailFromApi,
  mapHotspotProductsFromApi,
  mapPartIdentificationFromApi,
  mapVehicleSystemsFromApi,
  parseDiagramsListResponse,
} from "@/lib/utils/mapPartFinderFromApi";

export const partFinderApi = {
  listVehicleSystems: async (): Promise<VehicleSystem[]> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>("/vehicle-systems");
    return mapVehicleSystemsFromApi(data);
  },

  listDiagrams: async (
    params: ListDiagramsParams
  ): Promise<DiagramsListResult> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>("/diagrams", {
      params: {
        make: params.make,
        model: params.model,
        year: params.year,
        ...(params.system ? { system: params.system } : {}),
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return parseDiagramsListResponse(data);
  },

  getDiagram: async (
    id: string,
    includeHotspots = true
  ): Promise<DiagramDetail> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(
      `/diagrams/${id}`,
      { params: { include_hotspots: includeHotspots } }
    );
    return mapDiagramDetailFromApi(data);
  },

  getHotspotProducts: async (
    diagramId: string,
    hotspotId: string,
    year?: number
  ): Promise<PartFinderProductSummary[]> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(
      `/diagrams/${diagramId}/hotspots/${hotspotId}/products`,
      { params: year != null ? { year } : undefined }
    );
    return mapHotspotProductsFromApi(data);
  },

  identifyPart: async (formData: FormData): Promise<PartIdentificationResult> => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/part-identification",
      formData
    );
    return mapPartIdentificationFromApi(data);
  },
};
