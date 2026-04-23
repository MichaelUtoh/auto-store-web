"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const isOpen = useUIStore((s) => s.isCartDrawerOpen);
  const closeCartDrawer = useUIStore((s) => s.closeCartDrawer);
  const items = useCartStore((s) => s.items);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 md:bg-transparent"
        aria-hidden="true"
        onClick={closeCartDrawer}
      />
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-surface shadow-xl",
          "animate-in slide-in-from-right duration-200"
        )}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-primary">Cart</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCartDrawer}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-secondary">
              <p>Your cart is empty.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/products" onClick={closeCartDrawer}>
                  Browse products
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <CartSummary onCheckout={closeCartDrawer} />
          </div>
        )}
      </div>
    </>
  );
}
