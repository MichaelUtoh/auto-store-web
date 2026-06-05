import type { Category, Product, VehicleCompatibility } from "@/types/product";
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  resolveProductCardImage,
} from "@/lib/utils/helpers";

/** Collect gallery / list image entries from varying API shapes. */
export function extractProductImagesFromApi(
  p: Record<string, unknown>
): Product["images"] {
  const arrays = [
    p.images,
    p.Images,
    p.product_images,
    p.productImages,
  ];
  for (const candidate of arrays) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate as Product["images"];
    }
  }
  const single =
    p.primary_image_url ??
    p.primaryImageUrl ??
    p.thumbnail_url ??
    p.thumbnailUrl ??
    p.image_url ??
    p.imageUrl ??
    p.image;
  if (typeof single === "string" && single.trim()) {
    return [single];
  }
  return [];
}

function extractThumbnailFields(
  p: Record<string, unknown>
): Pick<Product, "thumbnailUrl" | "imageUrl"> {
  const primary =
    p.primary_image_url ??
    p.primaryImageUrl ??
    p.thumbnail_url ??
    p.thumbnailUrl ??
    p.image_url ??
    p.imageUrl ??
    p.image;
  const primaryStr =
    typeof primary === "string" && primary.trim() ? primary : undefined;
  return {
    thumbnailUrl: (p.thumbnail_url ??
      p.thumbnailUrl ??
      primaryStr) as string | undefined,
    imageUrl: (p.image_url ?? p.imageUrl ?? primaryStr) as string | undefined,
  };
}

/** True when a mapped product has a renderable card image. */
export function productHasCardImage(product: Product): boolean {
  return resolveProductCardImage(product) !== PRODUCT_IMAGE_PLACEHOLDER;
}

function mapCategoryFromApi(raw: unknown): Category | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const c = raw as Record<string, unknown>;
  const id = c.id;
  if (id == null) return undefined;
  return {
    id: String(id),
    name: String(c.name ?? ""),
    slug: String(c.slug ?? ""),
    parentId: (c.parent_id ?? c.parentId) as string | undefined,
    image: (c.image ?? c.image_url ?? c.imageUrl) as string | undefined,
    productCount: Number(c.product_count ?? c.productCount ?? 0) || undefined,
  };
}

function mapVehicleCompatibilityFromApi(raw: unknown): VehicleCompatibility {
  const v = raw as Record<string, unknown>;
  return {
    make: String(v.make ?? ""),
    model: String(v.model ?? ""),
    yearFrom: Number(v.year_from ?? v.yearFrom ?? 0) || undefined,
    yearTo: Number(v.year_to ?? v.yearTo ?? 0) || undefined,
  };
}

/** Normalize product JSON from list/detail/wishlist (snake_case or camelCase). */
export function mapProductFromApi(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const id = p.id ?? p.product_id ?? p.productId;
  if (id == null || id === "") return null;

  const categoryRaw = p.category ?? p.Category;
  const category = mapCategoryFromApi(categoryRaw);
  const categoryId = String(
    p.category_id ?? p.categoryId ?? category?.id ?? ""
  );

  const compatRaw = p.vehicle_compatibility ?? p.vehicleCompatibility;
  const vehicleCompatibility = Array.isArray(compatRaw)
    ? compatRaw.map(mapVehicleCompatibilityFromApi)
    : undefined;

  const thumbs = extractThumbnailFields(p);

  return {
    id: String(id),
    name: String(p.name ?? ""),
    slug: String(p.slug ?? ""),
    description: (p.description as string | undefined) ?? undefined,
    price: Number(p.price ?? 0),
    compareAtPrice:
      Number(p.compare_at_price ?? p.compareAtPrice ?? 0) || undefined,
    images: extractProductImagesFromApi(p),
    thumbnailUrl: thumbs.thumbnailUrl,
    imageUrl: thumbs.imageUrl,
    categoryId,
    category,
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : undefined,
    sku: (p.sku as string | undefined) ?? undefined,
    stock: Number(p.stock ?? p.stock_quantity ?? p.stockQuantity ?? 0) || undefined,
    specs: (p.specs as Record<string, string> | undefined) ?? undefined,
    vehicleCompatibility,
    createdAt: String(p.created_at ?? p.createdAt ?? ""),
    updatedAt: String(p.updated_at ?? p.updatedAt ?? ""),
  };
}
