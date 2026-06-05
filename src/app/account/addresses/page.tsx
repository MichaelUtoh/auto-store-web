"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usersApi } from "@/lib/api/users";
import { savedAddressToDisplayLines } from "@/lib/utils/mapAddressFromApi";
import type { SavedAddress } from "@/types/address";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .getAddresses()
      .then(setAddresses)
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
            Add one at checkout when you place an order.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <Card key={addr.id}>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {addr.type}
              </Badge>
              {addr.isDefault && (
                <Badge variant="outline">Default</Badge>
              )}
            </div>
            <div className="mt-2 text-sm text-secondary">
              {savedAddressToDisplayLines(addr).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
