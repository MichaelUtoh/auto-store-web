"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Ensures _hasHydrated is set after persist rehydrates, so protected layouts don't redirect on refresh.
 * Fallback: if still not hydrated after a short delay, set it so we never block indefinitely.
 */
export function AuthHydration() {
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.setState({ _hasHydrated: true });
    });
    const fallback = setTimeout(() => {
      if (!useAuthStore.getState()._hasHydrated) {
        useAuthStore.setState({ _hasHydrated: true });
      }
    }, 100);
    return () => {
      unsub?.();
      clearTimeout(fallback);
    };
  }, []);
  return null;
}
