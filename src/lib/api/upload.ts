import { apiClient } from "./client";

export interface ProductImageInput {
  url: string;
  alt_text?: string;
  display_order?: number;
  is_primary?: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  display_order?: number;
  is_primary?: boolean;
  created_at: string;
  updated_at: string;
}

/** ~5 MiB — matches typical server limits */
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const PRODUCT_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ProductImageAllowedMime = (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number];

/**
 * Client-side validation for product image uploads (JPEG / PNG / WebP, max ~5 MB).
 * Returns a user-facing message or null if valid.
 */
export function validateProductImageFile(file: File): string | null {
  if (
    !PRODUCT_IMAGE_ALLOWED_TYPES.includes(file.type as ProductImageAllowedMime)
  ) {
    return file.type
      ? `${file.name}: only JPEG, PNG, or WebP are allowed.`
      : `${file.name}: could not detect file type; use JPEG, PNG, or WebP.`;
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return `${file.name}: max size is 5 MB.`;
  }
  return null;
}

export interface UploadImagesResponseBody {
  success: boolean;
  data?: { urls: string[] };
  error?: string;
}

/**
 * POST multipart `/upload/images` with repeated `file` fields.
 * Parses `{ success, data: { urls } }`. Bearer token is set by apiClient.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("file", file);
  }
  const { data } = await apiClient.post<UploadImagesResponseBody>(
    "/upload/images",
    formData
  );
  if (!data.success) {
    throw new Error(data.error ?? "Upload failed");
  }
  const urls = data.data?.urls;
  if (!Array.isArray(urls)) {
    throw new Error("Unexpected response from image upload");
  }
  return urls.map((u) => u.trim()).filter((u) => u.length > 0);
}

type AddProductImagesBody = {
  success?: boolean;
  data?: ProductImage[];
  error?: string;
};

function extractCreatedImages(body: AddProductImagesBody): ProductImage[] {
  if (body.success === false) {
    throw new Error(body.error ?? "Failed to add product images");
  }
  const created = body.data;
  if (!Array.isArray(created)) {
    throw new Error("Unexpected response from add product images");
  }
  return created;
}

/**
 * POST `/products/:productUuid/images` with JSON `{ images: [...] }`.
 */
export async function addProductImages(
  productId: string,
  images: ProductImageInput[]
): Promise<ProductImage[]> {
  const { data } = await apiClient.post<AddProductImagesBody>(
    `/products/${productId}/images`,
    { images }
  );
  return extractCreatedImages(data);
}

/**
 * DELETE `/products/:productId/images/:imageId` — 204 No Content on success.
 */
export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<void> {
  await apiClient.delete(`/products/${productId}/images/${imageId}`);
}
