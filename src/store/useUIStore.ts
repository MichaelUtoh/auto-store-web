import { create } from "zustand";

interface UIStore {
  isMobileMenuOpen: boolean;
  isCartDrawerOpen: boolean;
  toggleMobileMenu: () => void;
  toggleCartDrawer: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,

  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),

  toggleCartDrawer: () =>
    set((s) => ({ isCartDrawerOpen: !s.isCartDrawerOpen })),

  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
