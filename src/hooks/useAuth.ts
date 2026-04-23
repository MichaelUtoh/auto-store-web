import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (store.accessToken && !store.user) {
      store.hydrate();
    }
  }, [store.accessToken, store.user, store.hydrate]);

  return store;
}
