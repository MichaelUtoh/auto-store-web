export type AddressType = "shipping" | "billing";

/** Saved address returned by GET/POST /users/me/addresses */
export interface SavedAddress {
  id: string;
  type: AddressType;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressBody {
  type: AddressType;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}
