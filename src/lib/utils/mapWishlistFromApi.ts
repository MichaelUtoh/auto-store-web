import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";
import {
  extractProductImagesFromApi,
  mapProductFromApi,
} from "@/lib/utils/mapProductFromApi";
import type { Product } from "@/types/product";

function extractWishlistArray(body: unknown): unknown[] {
  const unwrapped = unwrapApiDataBody(body);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (unwrapped && typeof unwrapped === "object") {
    const o = unwrapped as Record<string, unknown>;
    const items = o.items ?? o.wishlist ?? o.products ?? o.data;
    if (Array.isArray(items)) return items;
  }
  if (body && typeof body === "object" && "data" in body) {
    const inner = (body as { data: unknown }).data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

function mergeWishlistRowImageFields(
  product: Record<string, unknown>,
  row: Record<string, unknown>
): Record<string, unknown> {
  if (extractProductImagesFromApi(product).length > 0) return product;
  const rowImages = extractProductImagesFromApi(row);
  if (rowImages.length === 0) return product;
  return { ...product, images: rowImages };
}

/** Resolve preloaded product payload from a wishlist row (nested or flattened). */
function resolveProductRawFromWishlistRow(
  entry: Record<string, unknown>
): Record<string, unknown> | null {
  const nested = entry.product ?? entry.Product;
  const productId = entry.product_id ?? entry.productId;

  if (nested && typeof nested === "object") {
    const n = { ...(nested as Record<string, unknown>) };
    if (!n.id && productId) n.id = productId;
    return mergeWishlistRowImageFields(n, entry);
  }

  const hasProductFields =
    typeof entry.name === "string" ||
    entry.price != null ||
    extractProductImagesFromApi(entry).length > 0;

  if (productId && hasProductFields) {
    return { ...entry, id: productId };
  }

  if (productId) {
    return { id: productId };
  }

  if (entry.id && hasProductFields) {
    return entry;
  }

  return null;
}

/**
 * GET /wishlist — products preloaded on each row or as a flat product list.
 */
export function mapWishlistProductsFromApi(body: unknown): Product[] {
  const rows = extractWishlistArray(body);
  const products: Product[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    if (typeof row === "string" && row.trim()) {
      continue;
    }
    if (!row || typeof row !== "object") continue;
    const entry = row as Record<string, unknown>;
    const productRaw = resolveProductRawFromWishlistRow(entry);
    if (!productRaw) continue;
    const mapped = mapProductFromApi(productRaw);
    if (!mapped || seen.has(mapped.id)) continue;
    seen.add(mapped.id);
    products.push(mapped);
  }

  return products;
}

/** Product IDs when the API returns only id strings or bare product_id rows. */
export function mapWishlistProductIdsFromApi(body: unknown): string[] {
  const rows = extractWishlistArray(body);
  return rows
    .map((row) => {
      if (typeof row === "string") return row.trim();
      if (row && typeof row === "object") {
        const o = row as Record<string, unknown>;
        const id = o.product_id ?? o.productId;
        if (typeof id === "string") return id.trim();
        if (typeof o.id === "string" && (o.name || o.price != null)) {
          return o.id.trim();
        }
      }
      return "";
    })
    .filter(Boolean);
}
