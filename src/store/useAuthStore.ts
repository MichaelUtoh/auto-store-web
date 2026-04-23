import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/api/auth";
import type { User, RegisterData } from "@/types/user";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** False until persist has rehydrated from localStorage (avoids redirect on refresh). */
  _hasHydrated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
  _setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const result = await authApi.login(email, password);
          set({
            user: result.user,
            accessToken: result.accessToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
          throw new Error("Login failed");
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          const result = await authApi.register(userData);
          set({
            user: result.user,
            accessToken: result.accessToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
          throw new Error("Registration failed");
        }
      },

      logout: () => {
        authApi.logout().catch(() => {});
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshToken: async () => {
        try {
          const result = await authApi.refresh();
          set({
            accessToken: result.accessToken ?? null,
            isAuthenticated: !!result.accessToken,
          });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
          throw new Error("Session expired");
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const user = await authApi.getProfile();
        set({ user: { ...user, ...data } });
      },

      setUser: (user) => set({ user }),

      hydrate: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          const user = await authApi.getProfile();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      _setHydrated: () => set({ _hasHydrated: true }),
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated?.();
      },
    }
  )
);
