"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";

/** Loads wishlist when authenticated; clears on sign-out. */
export function WishlistHydration() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      clearWishlist();
    }
  }, [isAuthenticated, fetchWishlist, clearWishlist]);

  return null;
}
