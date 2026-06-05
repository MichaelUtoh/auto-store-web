import { apiClient } from "./client";
import type { User } from "@/types/user";
import type { ApiResponse } from "@/types/api";
import type { AddressType, SavedAddress } from "@/types/address";
import type { AddressInput } from "@/lib/utils/validators";
import {
  addressInputToCreateBody,
  mapAddressFromApi,
  mapAddressesFromApi,
} from "@/lib/utils/mapAddressFromApi";
import {
  mapUserFromApi,
  unwrapApiDataBody,
} from "@/lib/utils/mapUserFromApi";

/** PATCH body many backends expect (snake_case). */
function profilePatchBody(payload: Partial<User>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.firstName !== undefined) body.first_name = payload.firstName;
  if (payload.lastName !== undefined) body.last_name = payload.lastName;
  if (payload.phone !== undefined) body.phone = payload.phone;
  if (payload.avatar !== undefined) body.avatar = payload.avatar;
  return body;
}

function mapAddressResponse(data: unknown): SavedAddress {
  const mapped = mapAddressFromApi(unwrapApiDataBody(data));
  if (!mapped) {
    throw new Error("Invalid address response from API");
  }
  return mapped;
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>("/users/me");
    const raw = unwrapApiDataBody(data);
    return mapUserFromApi(raw);
  },

  updateProfile: async (payload: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<unknown>>(
      "/users/me",
      profilePatchBody(payload)
    );
    const raw = unwrapApiDataBody(data);
    if (
      raw &&
      typeof raw === "object" &&
      "id" in raw &&
      "email" in raw
    ) {
      return mapUserFromApi(raw);
    }
    return usersApi.getProfile();
  },

  getAddresses: async (): Promise<SavedAddress[]> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(
      "/users/me/addresses"
    );
    return mapAddressesFromApi(data);
  },

  createAddress: async (
    input: AddressInput,
    type: AddressType,
    isDefault = false
  ): Promise<SavedAddress> => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/users/me/addresses",
      addressInputToCreateBody(input, type, isDefault)
    );
    return mapAddressResponse(data);
  },

  updateAddress: async (
    id: string,
    input: Partial<AddressInput> & { type?: AddressType; isDefault?: boolean }
  ): Promise<SavedAddress> => {
    const body: Record<string, unknown> = {};
    if (input.type) body.type = input.type;
    if (input.line1 !== undefined) {
      const street = [input.line1.trim(), input.line2?.trim()]
        .filter(Boolean)
        .join(", ");
      body.street = street;
    }
    if (input.city !== undefined) body.city = input.city;
    if (input.state !== undefined) body.state = input.state;
    if (input.postalCode !== undefined) body.postal_code = input.postalCode;
    if (input.country !== undefined) {
      body.country =
        input.country === "US" ? "USA" : input.country;
    }
    if (input.isDefault !== undefined) body.is_default = input.isDefault;

    const { data } = await apiClient.put<ApiResponse<unknown>>(
      `/users/me/addresses/${id}`,
      body
    );
    return mapAddressResponse(data);
  },

  deleteAddress: async (id: string) => {
    await apiClient.delete(`/users/me/addresses/${id}`);
  },
};
