"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GarageVehiclePicker } from "@/components/garage/GarageVehiclePicker";
import { SystemChips } from "@/components/part-finder/SystemChips";
import { DiagramViewer } from "@/components/part-finder/DiagramViewer";
import { HotspotProductDrawer } from "@/components/part-finder/HotspotProductDrawer";
import { partFinderApi } from "@/lib/api/partFinder";
import { useGarageStore } from "@/store/useGarageStore";
import type {
  DiagramDetail,
  DiagramHotspot,
  DiagramListItem,
  VehicleSystem,
} from "@/types/partFinder";
import { Skeleton } from "@/components/ui/skeleton";

export function PartFinderHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicle = useGarageStore((s) => s.vehicle);
  const hydrateFromQuery = useGarageStore((s) => s.hydrateFromQuery);

  const [systems, setSystems] = useState<VehicleSystem[]>([]);
  const [systemCode, setSystemCode] = useState(
    searchParams.get("system") ?? ""
  );
  const [diagrams, setDiagrams] = useState<DiagramListItem[]>([]);
  const [selectedDiagramId, setSelectedDiagramId] = useState(
    searchParams.get("diagramId") ?? ""
  );
  const [diagramDetail, setDiagramDetail] = useState<DiagramDetail | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<DiagramHotspot | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDiagram, setLoadingDiagram] = useState(false);

  useEffect(() => {
    hydrateFromQuery({
      make: searchParams.get("make"),
      model: searchParams.get("model"),
      year: searchParams.get("year"),
    });
    const sys = searchParams.get("system");
    if (sys) setSystemCode(sys);
    const dId = searchParams.get("diagramId");
    if (dId) setSelectedDiagramId(dId);
  }, [searchParams, hydrateFromQuery]);

  useEffect(() => {
    partFinderApi.listVehicleSystems().then(setSystems).catch(() => []);
  }, []);

  const syncUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (!v) params.delete(k);
        else params.set(k, v);
      });
      router.replace(`/parts?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (!vehicle?.make || !vehicle?.model || !vehicle?.year || !systemCode) {
      setDiagrams([]);
      setDiagramDetail(null);
      return;
    }

    let cancelled = false;
    setLoadingList(true);
    const urlDiagram = searchParams.get("diagramId");

    partFinderApi
      .listDiagrams({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        system: systemCode,
        limit: 20,
      })
      .then((res) => {
        if (cancelled) return;
        setDiagrams(res.items);
        if (res.items.length === 0) {
          setSelectedDiagramId("");
          setDiagramDetail(null);
          return;
        }
        const pick =
          res.items.find((d) => d.id === urlDiagram) ?? res.items[0];
        setSelectedDiagramId(pick.id);
      })
      .catch(() => {
        if (!cancelled) setDiagrams([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    vehicle?.make,
    vehicle?.model,
    vehicle?.year,
    systemCode,
    searchParams,
  ]);

  useEffect(() => {
    if (!selectedDiagramId) {
      setDiagramDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingDiagram(true);
    partFinderApi
      .getDiagram(selectedDiagramId, true)
      .then((detail) => {
        if (cancelled) return;
        setDiagramDetail(detail);
        const hotspotId = searchParams.get("hotspotId");
        if (hotspotId) {
          const h = detail.hotspots.find((x) => x.id === hotspotId);
          if (h) {
            setSelectedHotspot(h);
            setDrawerOpen(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setDiagramDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDiagram(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDiagramId]);

  const handleSystemSelect = (code: string) => {
    setSystemCode(code);
    setSelectedDiagramId("");
    syncUrl({ system: code, diagramId: undefined, hotspotId: undefined });
  };

  const handleDiagramChange = (id: string) => {
    setSelectedDiagramId(id);
    setSelectedHotspot(null);
    setDrawerOpen(false);
    syncUrl({ diagramId: id, hotspotId: undefined });
  };

  const handleHotspotSelect = (hotspot: DiagramHotspot) => {
    setSelectedHotspot(hotspot);
    setDrawerOpen(true);
    syncUrl({ hotspotId: hotspot.id });
  };

  const vehicleReady = Boolean(
    vehicle?.make?.trim() && vehicle?.model?.trim() && vehicle?.year
  );

  return (
    <div className="page-container py-6 sm:py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Visual Part Finder</h1>
          <p className="mt-2 max-w-xl text-sm text-secondary sm:text-base">
            Click components on exploded diagrams to shop matching parts for your
            vehicle.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/parts/identify">
            <Camera className="mr-2 h-4 w-4" />
            Identify from photo
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-10">
        <div className="space-y-6">
          <GarageVehiclePicker />

          {vehicleReady && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-foreground">System</h2>
              <SystemChips
                systems={systems}
                selected={systemCode}
                onSelect={handleSystemSelect}
              />
            </div>
          )}

          {diagrams.length > 1 && (
            <div>
              <label
                htmlFor="diagram-select"
                className="text-sm font-bold text-foreground"
              >
                Diagram variant
              </label>
              <select
                id="diagram-select"
                className="select-field mt-2"
                value={selectedDiagramId}
                onChange={(e) => handleDiagramChange(e.target.value)}
              >
                {diagrams.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.yearStart}–{d.yearEnd})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="min-w-0">
          {!vehicleReady ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl bg-muted px-6 text-center">
              <p className="text-secondary">
                Select your vehicle to see diagrams
              </p>
            </div>
          ) : !systemCode ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl bg-muted px-6 text-center">
              <p className="text-secondary">Choose a system to continue</p>
            </div>
          ) : loadingList || loadingDiagram ? (
            <div className="space-y-4">
              <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
            </div>
          ) : !diagramDetail ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl bg-muted px-6 text-center">
              <p className="text-secondary">
                No diagram for this vehicle yet — try search or browse
                categories.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/search">Search parts</Link>
              </Button>
            </div>
          ) : (
            <DiagramViewer
              diagram={diagramDetail}
              selectedHotspotId={selectedHotspot?.id}
              onHotspotSelect={handleHotspotSelect}
            />
          )}
        </div>
      </div>

      <HotspotProductDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          syncUrl({ hotspotId: undefined });
        }}
        diagramId={selectedDiagramId}
        hotspot={selectedHotspot}
        vehicle={vehicle}
      />
    </div>
  );
}
