import type { Order } from "@/types/order";
import { mapOrderShippingAddressFromApi } from "@/lib/utils/mapAddressFromApi";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

export function mapOrderFromApi(raw: unknown): Order | null {
  const o = unwrapApiDataBody(raw) as Record<string, unknown> | null;
  if (!o || typeof o !== "object" || o.id == null) return null;
  const itemsRaw = o.items ?? o.order_items ?? o.line_items;
  const items = Array.isArray(itemsRaw) ? itemsRaw : [];
  const shippingRaw =
    o.shipping_address ?? o.shippingAddress ?? o.shipping_address_snapshot;

  const createdAt = String(
    o.created_at ??
      o.createdAt ??
      o.placed_at ??
      o.placedAt ??
      o.ordered_at ??
      ""
  );
  const updatedAt = String(
    o.updated_at ?? o.updatedAt ?? createdAt
  );

  return {
    id: String(o.id),
    orderNumber: String(
      o.order_number ?? o.orderNumber ?? o.number ?? o.id
    ),
    items: items.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        productId: String(row.product_id ?? row.productId ?? ""),
        name: String(row.name ?? row.product_name ?? "Item"),
        quantity: Number(row.quantity ?? 1),
        price: Number(row.price ?? row.unit_price ?? row.unitPrice ?? 0),
        image: (row.image ?? row.image_url ?? row.imageUrl) as
          | string
          | undefined,
      };
    }),
    subtotal: Number(o.subtotal ?? o.sub_total ?? 0),
    shipping: Number(o.shipping ?? o.shipping_cost ?? o.shippingCost ?? 0),
    tax: Number(o.tax ?? o.tax_amount ?? o.taxAmount ?? 0) || undefined,
    total: Number(o.total ?? o.total_amount ?? o.totalAmount ?? 0),
    status: (o.status as Order["status"]) ?? "pending",
    shippingAddress: mapOrderShippingAddressFromApi(shippingRaw),
    createdAt,
    updatedAt,
  };
}

export function mapOrdersListFromApi(body: unknown): Order[] {
  const unwrapped = unwrapApiDataBody(body);
  let list: unknown[] = [];

  if (Array.isArray(unwrapped)) {
    list = unwrapped;
  } else if (unwrapped && typeof unwrapped === "object") {
    const o = unwrapped as Record<string, unknown>;
    const nested = o.data ?? o.items ?? o.orders ?? o.results;
    if (Array.isArray(nested)) list = nested;
    else if (nested && typeof nested === "object") {
      const inner = nested as Record<string, unknown>;
      if (Array.isArray(inner.data)) list = inner.data;
    }
  }

  if (list.length === 0 && body && typeof body === "object" && "data" in body) {
    const top = (body as { data: unknown }).data;
    if (Array.isArray(top)) list = top;
  }

  return list
    .map(mapOrderFromApi)
    .filter((order): order is Order => order != null);
}
