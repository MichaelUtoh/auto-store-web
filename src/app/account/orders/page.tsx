"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { ordersApi } from "@/lib/api/orders";
import type { Order } from "@/types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getOrders(1, 20)
      .then((res) => {
        const raw = res as unknown as { data?: { data?: Order[] } | Order[] };
        const data =
          raw.data && !Array.isArray(raw.data)
            ? raw.data.data
            : Array.isArray(raw.data)
              ? raw.data
              : undefined;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-secondary">
          Loading orders…
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-secondary">
          <p>No orders yet.</p>
          <Link href="/products" className="mt-4 inline-block font-medium text-primary underline-offset-4 hover:underline">
            Browse products
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link
              href={`/account/orders/${order.id}`}
              className="font-semibold text-primary hover:underline"
            >
              #{order.orderNumber}
            </Link>
            <Badge variant="secondary">{order.status}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary">
              {formatDate(order.createdAt)} · {formatPrice(order.total)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
