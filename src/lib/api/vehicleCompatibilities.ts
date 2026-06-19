import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  VehicleCompatibilityCatalog,
  VehicleCompatibilityCreateInput,
  VehicleCompatibilityListParams,
} from "@/types/vehicleCompatibility";
import {
  mapVehicleCompatibilityCatalogFromApi,
  mapVehicleCompatibilityCatalogListFromApi,
} from "@/lib/utils/mapVehicleCompatibilityFromApi";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

function extractListBody(data: unknown): unknown[] {
  const unwrapped = unwrapApiDataBody(data);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (unwrapped && typeof unwrapped === "object") {
    const inner = (unwrapped as { data?: unknown }).data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

export const vehicleCompatibilitiesApi = {
  list: async (
    params: VehicleCompatibilityListParams = {}
  ): Promise<VehicleCompatibilityCatalog[]> => {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<VehicleCompatibilityCatalog> | VehicleCompatibilityCatalog[]>
    >("/vehicle-compatibilities", { params });
    return mapVehicleCompatibilityCatalogListFromApi(extractListBody(data));
  },

  create: async (
    payload: VehicleCompatibilityCreateInput
  ): Promise<VehicleCompatibilityCatalog> => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/vehicle-compatibilities",
      payload
    );
    const mapped = mapVehicleCompatibilityCatalogFromApi(unwrapApiDataBody(data));
    if (!mapped) {
      throw new Error("Invalid compatibility response from API");
    }
    return mapped;
  },
};
