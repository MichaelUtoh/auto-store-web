import { productsApi } from "@/lib/api/products";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import {
  extractProductImagesFromApi,
  mapProductFromApi,
  productHasCardImage,
} from "@/lib/utils/mapProductFromApi";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

function extractCartItemRows(body: unknown): unknown[] {
  if (body == null) return [];

  const fromNode = (node: unknown): unknown[] | null => {
    if (node == null) return null;
    if (Array.isArray(node)) return node;
    if (typeof node !== "object") return null;
    const o = node as Record<string, unknown>;
    const items = o.items ?? o.cart_items ?? o.line_items;
    if (Array.isArray(items)) return items;
    if (o.cart != null && typeof o.cart === "object") {
      const c = o.cart as Record<string, unknown>;
      const nested = c.items ?? c.cart_items;
      if (Array.isArray(nested)) return nested;
    }
    return null;
  };

  const direct = fromNode(body);
  if (direct) return direct;

  const unwrapped = unwrapApiDataBody(body);
  const fromUnwrapped = fromNode(unwrapped);
  if (fromUnwrapped) return fromUnwrapped;

  if (typeof body === "object" && body !== null && "data" in body) {
    const inner = (body as { data: unknown }).data;
    const fromInner = fromNode(inner);
    if (fromInner) return fromInner;
    if (inner != null && typeof inner === "object" && "data" in inner) {
      const nested = fromNode((inner as { data: unknown }).data);
      if (nested) return nested;
    }
  }

  return [];
}

/** Image URLs sometimes live on the cart line, not on nested `product`. */
function extractCartLineImagesFromRow(
  row: Record<string, unknown>
): Product["images"] {
  const fromProduct = extractProductImagesFromApi(row);
  if (fromProduct.length > 0) return fromProduct;
  const url =
    row.product_image_url ??
    row.productImageUrl ??
    row.product_thumbnail_url ??
    row.productThumbnailUrl ??
    row.thumbnail_url ??
    row.thumbnailUrl ??
    row.image_url ??
    row.imageUrl ??
    row.thumbnail;
  if (typeof url === "string" && url.trim()) return [url];
  return [];
}

function mergeCartRowImageFields(
  product: Product,
  row: Record<string, unknown>
): Product {
  if (productHasCardImage(product)) return product;
  const images = extractCartLineImagesFromRow(row);
  if (images.length === 0) return product;
  return { ...product, images };
}

function minimalProduct(
  productId: string,
  row: Record<string, unknown>
): Product {
  const fromMapper = mapProductFromApi({
    id: productId,
    name: row.product_name ?? row.name,
    price: row.unit_price ?? row.price,
    images: extractCartLineImagesFromRow(row),
    primary_image_url:
      row.primary_image_url ??
      row.product_image_url ??
      row.image_url,
  });
  if (fromMapper) return fromMapper;
  return {
    id: productId,
    name: String(row.product_name ?? row.name ?? "Product"),
    slug: "",
    price: Number(row.unit_price ?? row.price ?? 0),
    images: extractCartLineImagesFromRow(row),
    categoryId: "",
    createdAt: "",
    updatedAt: "",
  };
}

async function loadProductForCartLine(productId: string): Promise<Product | null> {
  try {
    const res = await productsApi.getProduct(productId);
    return mapProductFromApi(unwrapApiDataBody(res));
  } catch {
    return null;
  }
}

/** Fetch product detail when cart preload omits gallery URLs. */
export async function enrichCartItemsMissingImages(
  items: CartItem[]
): Promise<CartItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (productHasCardImage(item.product)) return item;
      const full = await loadProductForCartLine(item.productId);
      if (full && productHasCardImage(full)) {
        return { ...item, product: full };
      }
      return item;
    })
  );
}

/** Map one cart line from API (snake_case or camelCase). */
export function mapCartItemFromApi(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  const lineId = row.id ?? row.cart_item_id ?? row.cartItemId;
  if (lineId == null || lineId === "") return null;

  const productRaw = row.product ?? row.Product;
  let product =
    productRaw != null ? mapProductFromApi(productRaw) : null;

  const productId = String(
    row.product_id ?? row.productId ?? product?.id ?? ""
  );
  if (!productId) return null;

  if (!product) {
    product = minimalProduct(productId, row);
  } else {
    product = mergeCartRowImageFields(product, row);
  }

  const unitPrice = Number(
    row.unit_price ??
      row.unitPrice ??
      row.price ??
      row.line_price ??
      product.price ??
      0
  );

  const quantity = Math.max(1, Number(row.quantity ?? 1));

  return {
    id: String(lineId),
    productId,
    product,
    quantity,
    price: Number.isFinite(unitPrice) ? unitPrice : product.price,
  };
}

/** Map full cart API response to normalized line items. */
export function mapCartItemsFromApi(body: unknown): CartItem[] {
  const rows = extractCartItemRows(body);
  const items: CartItem[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const mapped = mapCartItemFromApi(row);
    if (!mapped || seen.has(mapped.id)) continue;
    seen.add(mapped.id);
    items.push(mapped);
  }

  return items;
}
