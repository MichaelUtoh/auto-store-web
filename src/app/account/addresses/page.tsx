"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usersApi } from "@/lib/api/users";
import type { OrderAddress } from "@/types/order";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<OrderAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .getAddresses()
      .then((res) => {
        const data = (res as { data?: OrderAddress[] }).data ?? res;
        setAddresses(Array.isArray(data) ? data : []);
      })
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-secondary">
          Loading…
        </CardContent>
      </Card>
    );
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-secondary">
          <p>No saved addresses.</p>
          <p className="mt-2 text-sm">
            Add one at checkout or when placing an order.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <p className="font-medium text-primary">
              {addr.firstName} {addr.lastName}
            </p>
            <p className="mt-1 text-sm text-secondary">
              {addr.line1}
              {addr.line2 && `, ${addr.line2}`}
              <br />
              {addr.city}, {addr.state} {addr.postalCode}
              <br />
              {addr.country} · {addr.phone}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
