import { API_BASE_URL } from "@/lib/constants";
import type { Product, ProductImageRow } from "@/types/product";

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "…";
}

export const PRODUCT_IMAGE_PLACEHOLDER = "/images/placeholder-product.svg";

const IMAGE_URL_KEYS = [
  "url",
  "image_url",
  "imageUrl",
  "src",
  "public_url",
  "publicUrl",
  "file_url",
  "fileUrl",
  "cdn_url",
  "cdnUrl",
  "link",
  "path",
] as const;

/**
 * Turn API strings into a usable `src`: absolute URLs as-is; leading `/` paths
 * resolved against the API origin (common when the backend returns stored paths).
 */
export function normalizeImageUrlString(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("/")) {
    try {
      const origin = new URL(API_BASE_URL).origin;
      return `${origin}${t}`;
    } catch {
      return t;
    }
  }
  return t;
}

function imageUrlFromObject(entry: Record<string, unknown>): string {
  for (const key of IMAGE_URL_KEYS) {
    const v = entry[key];
    if (typeof v === "string") {
      const n = normalizeImageUrlString(v);
      if (n) return n;
    }
  }
  return "";
}

/**
 * API may return each image as a URL string or as an object with varying keys.
 */
export function resolveProductImageSrc(entry: unknown): string {
  if (typeof entry === "string") {
    const n = normalizeImageUrlString(entry);
    return n || PRODUCT_IMAGE_PLACEHOLDER;
  }
  if (entry !== null && typeof entry === "object") {
    const n = imageUrlFromObject(entry as Record<string, unknown>);
    if (n) return n;
  }
  return PRODUCT_IMAGE_PLACEHOLDER;
}

/**
 * Prefer the last image entry that resolves to a real URL (newest in append-only APIs).
 */
export function pickLatestProductImageSrc(images: unknown): string {
  if (!Array.isArray(images) || images.length === 0) {
    return PRODUCT_IMAGE_PLACEHOLDER;
  }
  for (let i = images.length - 1; i >= 0; i--) {
    const src = resolveProductImageSrc(images[i]);
    if (src !== PRODUCT_IMAGE_PLACEHOLDER) return src;
  }
  return PRODUCT_IMAGE_PLACEHOLDER;
}

/**
 * Grid/card image: latest valid gallery URL, then list-only thumbnail fields.
 */
export function resolveProductCardImage(product: Product): string {
  const list = (product as { images?: unknown }).images;
  const fromGallery = pickLatestProductImageSrc(list ?? []);
  if (fromGallery !== PRODUCT_IMAGE_PLACEHOLDER) return fromGallery;

  const p = product as Product & {
    image_url?: string;
    thumbnail_url?: string;
  };
  const fallback =
    p.thumbnailUrl ??
    p.imageUrl ??
    p.image_url ??
    p.thumbnail_url ??
    (p as { primary_image_url?: string }).primary_image_url ??
    (p as { primaryImageUrl?: string }).primaryImageUrl;
  if (typeof fallback === "string") {
    const n = normalizeImageUrlString(fallback);
    if (n) return n;
  }
  return PRODUCT_IMAGE_PLACEHOLDER;
}

/** Non-empty list of string URLs for rendering (placeholder if none). */
export function normalizeProductImages(images: unknown): string[] {
  if (!Array.isArray(images) || images.length === 0) {
    return [PRODUCT_IMAGE_PLACEHOLDER];
  }
  return images.map(resolveProductImageSrc);
}

/** Admin edit: map API `images` to rows with optional `id` for DELETE. */
export function productImagesToFormRows(images: unknown): ProductImageRow[] {
  if (!Array.isArray(images)) return [];
  const rows: ProductImageRow[] = [];
  for (const entry of images) {
    const resolved = resolveProductImageSrc(entry);
    if (resolved === PRODUCT_IMAGE_PLACEHOLDER) continue;
    if (typeof entry === "object" && entry !== null) {
      const e = entry as { id?: unknown; image_id?: unknown };
      const idRaw = e.id ?? e.image_id;
      const id =
        typeof idRaw === "string" && idRaw.trim() ? idRaw.trim() : undefined;
      rows.push(id ? { id, url: resolved } : { url: resolved });
    } else {
      rows.push({ url: resolved });
    }
  }
  return rows;
}

/** Real image URL strings (drops invalid entries). */
export function productImagesToUrlStrings(images: unknown): string[] {
  return productImagesToFormRows(images).map((r) => r.url);
}

/**
 * True when `src` is an absolute remote URL. Use with `next/image` `unoptimized`
 * so the browser loads S3/CDN directly. The default optimizer proxies via
 * `/_next/image`, which breaks many presigned URLs and can fail for private storage.
 */
export function isRemoteImageSrc(src: unknown): boolean {
  return (
    typeof src === "string" &&
    (src.startsWith("http://") || src.startsWith("https://"))
  );
}
