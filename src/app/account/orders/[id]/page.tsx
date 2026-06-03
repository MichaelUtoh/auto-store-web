"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { ordersApi } from "@/lib/api/orders";
import type { Order } from "@/types/order";
import { SupportHelpButton } from "@/components/support/SupportHelpButton";
import { openSupportChat } from "@/store/useSupportChatStore";

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    ordersApi
      .getOrder(id)
      .then((res) => {
        const data = (res as { data?: Order }).data ?? res;
        setOrder(data as Order);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order || searchParams.get("openSupport") !== "1") return;
    openSupportChat({
      contextType: "order",
      contextId: order.id,
      label: `About order #${order.orderNumber}`,
    });
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("openSupport");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [order, searchParams]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-secondary">
          Loading…
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <div className="text-center">
        <p className="text-secondary">Order not found.</p>
        <Button asChild className="mt-4">
          <Link href="/account/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const { shippingAddress } = order;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-primary">
          Order #{order.orderNumber}
        </h2>
        <Badge variant="secondary">{order.status}</Badge>
      </div>
      <p className="text-sm text-secondary">
        Placed on {formatDate(order.createdAt)}
      </p>
      <SupportHelpButton
        contextType="order"
        contextId={order.id}
        contextLabel={`About order #${order.orderNumber}`}
        label="Questions about this order?"
      />

      <Card>
        <CardHeader>
          <h3 className="font-medium text-primary">Items</h3>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between py-3">
                <span className="text-primary">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-primary">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.shipping != null && (
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Shipping</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
            )}
            {order.tax != null && (
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-primary">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-medium text-primary">Shipping address</h3>
        </CardHeader>
        <CardContent className="text-sm text-secondary">
          {shippingAddress.firstName} {shippingAddress.lastName}
          <br />
          {shippingAddress.line1}
          {shippingAddress.line2 && (
            <>
              <br />
              {shippingAddress.line2}
            </>
          )}
          <br />
          {shippingAddress.city}, {shippingAddress.state}{" "}
          {shippingAddress.postalCode}
          <br />
          {shippingAddress.country}
          <br />
          {shippingAddress.phone}
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/account/orders">Back to orders</Link>
      </Button>
    </div>
  );
}
