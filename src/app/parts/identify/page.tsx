"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SystemChips } from "@/components/part-finder/SystemChips";
import { GarageVehiclePicker } from "@/components/garage/GarageVehiclePicker";
import { partFinderApi } from "@/lib/api/partFinder";
import { useAuthStore } from "@/store/useAuthStore";
import { useGarageStore } from "@/store/useGarageStore";
import type {
  PartIdentificationCandidate,
  VehicleSystem,
} from "@/types/partFinder";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { cn } from "@/lib/utils";

export default function PartIdentifyPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const vehicle = useGarageStore((s) => s.vehicle);

  const [systems, setSystems] = useState<VehicleSystem[]>([]);
  const [systemCode, setSystemCode] = useState("");
  const [labels, setLabels] = useState("");
  const [uploading, setUploading] = useState(false);
  const [candidates, setCandidates] = useState<PartIdentificationCandidate[]>(
    []
  );

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/parts/identify");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    partFinderApi.listVehicleSystems().then(setSystems).catch(() => []);
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vehicle) {
      toast.error("Select your vehicle first");
      return;
    }

    const form = new FormData();
    form.append("image", file);
    form.append("file", file);
    form.append("make", vehicle.make);
    form.append("model", vehicle.model);
    form.append("year", String(vehicle.year));
    if (systemCode) form.append("system", systemCode);
    if (labels.trim()) {
      const labelList = labels.split(",").map((l) => l.trim()).filter(Boolean);
      form.append("labels", JSON.stringify(labelList));
    }

    setUploading(true);
    setCandidates([]);
    try {
      const result = await partFinderApi.identifyPart(form);
      setCandidates(result.candidates.slice(0, 3));
      if (result.candidates.length === 0) {
        toast.error("No parts identified — try another angle or label");
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.response?.status === 503) {
        toast.error("Photo upload unavailable");
      } else {
        toast.error("Identification failed");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="page-container py-16 text-center text-secondary">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl py-6 sm:py-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/parts">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to part finder
        </Link>
      </Button>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <h1 className="text-2xl font-bold text-foreground">
            Identify from photo
          </h1>
          <p className="text-sm text-secondary">
            Upload a photo of the component. We&apos;ll suggest matches — please
            confirm before shopping.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <GarageVehiclePicker showDemoFill />

          {vehicle && (
            <>
              <div>
                <h2 className="mb-2 text-sm font-bold text-foreground">
                  System hint (optional)
                </h2>
                <SystemChips
                  systems={systems}
                  selected={systemCode}
                  onSelect={setSystemCode}
                />
              </div>

              <div>
                <label
                  htmlFor="labels"
                  className="text-sm font-semibold text-foreground"
                >
                  Labels (optional)
                </label>
                <input
                  id="labels"
                  type="text"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  placeholder="e.g. brake pad, rotor"
                  className="input-field mt-2"
                />
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/50 px-6 py-12 transition-colors hover:bg-muted">
                <Camera className="h-10 w-10 text-secondary" strokeWidth={1.5} />
                <span className="mt-3 text-sm font-medium text-foreground">
                  {uploading ? "Analyzing…" : "Take or upload photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  disabled={uploading}
                  onChange={handleFile}
                />
              </label>
            </>
          )}

          {candidates.length > 0 && (
            <ul className="space-y-3">
              <p className="text-sm font-bold text-foreground">Top matches</p>
              {candidates.map((c, i) => {
                const low = c.confidence < 0.6;
                const partsHref =
                  c.diagramId && c.hotspotId && vehicle
                    ? `/parts?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&year=${vehicle.year}&diagramId=${c.diagramId}&hotspotId=${c.hotspotId}`
                    : null;
                return (
                  <li
                    key={i}
                    className="rounded-2xl border border-border bg-muted/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">
                        {c.partName}
                      </p>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          low ? "text-error" : "text-secondary"
                        )}
                      >
                        {Math.round(c.confidence * 100)}%
                        {low && " · Low confidence"}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${c.confidence * 100}%` }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {partsHref && (
                        <Button size="sm" asChild>
                          <Link href={partsHref}>Show on diagram</Link>
                        </Button>
                      )}
                      {c.productIds[0] && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/products/${c.productIds[0]}`}>
                            View product
                          </Link>
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
