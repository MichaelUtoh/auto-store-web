import { ordersApi } from "@/lib/api/orders";
import { usersApi } from "@/lib/api/users";
import type { Order } from "@/types/order";
import type { AddressInput } from "@/lib/utils/validators";

export interface PlaceOrderOptions {
  billingSameAsShipping?: boolean;
  paymentMethod?: string;
}

/**
 * Checkout flow: create shipping (and optional billing) address, then POST /orders.
 */
export async function placeOrderFromCheckout(
  input: AddressInput,
  options: PlaceOrderOptions = {}
): Promise<Order> {
  const billingSameAsShipping = options.billingSameAsShipping !== false;
  const paymentMethod = options.paymentMethod ?? "credit_card";

  const shippingAddress = await usersApi.createAddress(input, "shipping", true);

  let billingAddressId = shippingAddress.id;
  if (!billingSameAsShipping) {
    const billingAddress = await usersApi.createAddress(
      input,
      "billing",
      false
    );
    billingAddressId = billingAddress.id;
  }

  const res = await ordersApi.createOrder({
    shippingAddressId: shippingAddress.id,
    billingAddressId,
    paymentMethod,
  });

  const order =
    res && typeof res === "object" && "data" in res
      ? (res as { data: Order }).data
      : (res as Order);

  if (!order?.id) {
    throw new Error("Order could not be created");
  }

  return order;
}
