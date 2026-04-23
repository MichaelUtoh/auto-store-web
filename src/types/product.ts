/** Product list/detail payloads: URL string or image row from API (optional `id` for admin DELETE). */
export type ProductImageEntry = string | { id?: string; url: string };

/** Admin edit form: `id` from API for DELETE /products/:productId/images/:imageId */
export interface ProductImageRow {
  id?: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImageEntry[];
  /** Some list APIs omit `images` or add a single preview field instead */
  thumbnailUrl?: string;
  imageUrl?: string;
  categoryId: string;
  category?: Category;
  tags?: string[];
  sku?: string;
  stock?: number;
  specs?: Record<string, string>;
  vehicleCompatibility?: VehicleCompatibility[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  image?: string;
  productCount?: number;
}

export interface VehicleCompatibility {
  make: string;
  model: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  make?: string;
  model?: string;
  year?: number;
  tags?: string[];
  sort?: "price_asc" | "price_desc" | "newest" | "popular";
  page?: number;
  limit?: number;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  tags?: string[];
  sku?: string;
  stock?: number;
  specs?: Record<string, string>;
  vehicleCompatibility?: VehicleCompatibility[];
}

/** Admin product edit: track image row ids for DELETE /products/:id/images/:imageId */
export type AdminEditProductForm = Omit<CreateProductPayload, "images"> & {
  images: ProductImageRow[];
};
