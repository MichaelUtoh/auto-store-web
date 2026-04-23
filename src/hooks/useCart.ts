import { useCartStore } from "@/store/useCartStore";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cart = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      cart.fetchCart();
    }
  }, [isAuthenticated, cart.fetchCart]);

  return {
    items: cart.items,
    totalItems: cart.getTotalItems(),
    totalPrice: cart.getTotalPrice(),
    fetchCart: cart.fetchCart,
    addItem: cart.addItem,
    removeItem: cart.removeItem,
    updateQuantity: cart.updateQuantity,
    clearCart: cart.clearCart,
    isLoading: cart.isLoading,
  };
}
