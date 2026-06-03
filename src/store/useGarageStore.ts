import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GarageVehicle } from "@/types/partFinder";

interface GarageStore {
  vehicle: GarageVehicle | null;
  setVehicle: (vehicle: GarageVehicle | null) => void;
  hydrateFromQuery: (params: {
    make?: string | null;
    model?: string | null;
    year?: string | null;
  }) => void;
}

export const useGarageStore = create<GarageStore>()(
  persist(
    (set, get) => ({
      vehicle: null,

      setVehicle: (vehicle) => set({ vehicle }),

      hydrateFromQuery: ({ make, model, year }) => {
        if (!make?.trim() || !model?.trim() || !year) return;
        const y = parseInt(year, 10);
        if (!Number.isFinite(y)) return;
        const next: GarageVehicle = {
          make: make.trim(),
          model: model.trim(),
          year: y,
        };
        const current = get().vehicle;
        if (
          current?.make === next.make &&
          current?.model === next.model &&
          current?.year === next.year
        ) {
          return;
        }
        set({ vehicle: next });
      },
    }),
    { name: "garage_vehicle" }
  )
);
