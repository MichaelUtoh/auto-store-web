"use client";

import { useCallback, useEffect, useState } from "react";
import { vehicleCompatibilitiesApi } from "@/lib/api/vehicleCompatibilities";
import type { VehicleCompatibilityCreateInput } from "@/types/vehicleCompatibility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  formatCompatibilityLabel,
  formatCompatibilityYearRange,
} from "@/lib/utils/mapVehicleCompatibilityFromApi";
import toast from "react-hot-toast";

const emptyCreateForm = (): VehicleCompatibilityCreateInput => ({
  make: "",
  model: "",
  generation: "",
  year_start: new Date().getFullYear(),
  year_end: new Date().getFullYear(),
  engine: "",
  trim: "",
  market_variant: "",
  notes: "",
});

export default function AdminVehicleCompatibilitiesPage() {
  const [items, setItems] = useState<
    Awaited<ReturnType<typeof vehicleCompatibilitiesApi.list>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    market_variant: "",
  });
  const [form, setForm] = useState<VehicleCompatibilityCreateInput>(
    emptyCreateForm()
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await vehicleCompatibilitiesApi.list({
        make: filters.make.trim() || undefined,
        model: filters.model.trim() || undefined,
        market_variant: filters.market_variant.trim() || undefined,
        limit: 200,
      });
      setItems(list);
    } catch {
      toast.error("Failed to load vehicle compatibilities.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters.make, filters.model, filters.market_variant]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make.trim() || !form.model.trim()) {
      toast.error("Make and model are required.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await vehicleCompatibilitiesApi.create({
        ...form,
        make: form.make.trim(),
        model: form.model.trim(),
        generation: form.generation?.trim() ?? "",
        year_start: Number(form.year_start) || 0,
        year_end: Number(form.year_end) || 0,
        engine: form.engine?.trim() ?? "",
        trim: form.trim?.trim() ?? "",
        market_variant: form.market_variant?.trim() ?? "",
        notes: form.notes?.trim() ?? "",
      });
      setItems((prev) => [created, ...prev]);
      setForm(emptyCreateForm());
      toast.success("Compatibility catalog entry created.");
    } catch {
      toast.error("Failed to create compatibility entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-primary">
          Vehicle compatibilities
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Global fitment catalog. Products link to these entries by UUID — no
          product is stored on the record itself.
        </p>
      </div>

      <section className="rounded-2xl border border-border p-5">
        <h2 className="text-sm font-semibold text-primary">Filter catalog</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="filter-make">Make</Label>
            <Input
              id="filter-make"
              value={filters.make}
              onChange={(e) =>
                setFilters((f) => ({ ...f, make: e.target.value }))
              }
              className="mt-1"
              placeholder="Toyota"
            />
          </div>
          <div>
            <Label htmlFor="filter-model">Model</Label>
            <Input
              id="filter-model"
              value={filters.model}
              onChange={(e) =>
                setFilters((f) => ({ ...f, model: e.target.value }))
              }
              className="mt-1"
              placeholder="Camry"
            />
          </div>
          <div>
            <Label htmlFor="filter-market">Market variant</Label>
            <Input
              id="filter-market"
              value={filters.market_variant}
              onChange={(e) =>
                setFilters((f) => ({ ...f, market_variant: e.target.value }))
              }
              className="mt-1"
              placeholder="US"
            />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={load}>
              Apply filters
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-5">
        <h2 className="text-sm font-semibold text-primary">Catalog entries</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-secondary">No entries match filters.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-secondary">
                  <th className="py-2 pr-3 font-medium">ID</th>
                  <th className="py-2 pr-3 font-medium">Fitment</th>
                  <th className="py-2 pr-3 font-medium">Years</th>
                  <th className="py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-2.5 pr-3 font-mono text-xs text-secondary">
                      {item.id.slice(0, 8)}…
                    </td>
                    <td className="py-2.5 pr-3 text-primary">
                      {formatCompatibilityLabel(item)}
                    </td>
                    <td className="py-2.5 pr-3 text-secondary">
                      {formatCompatibilityYearRange(
                        item.year_start,
                        item.year_end
                      )}
                    </td>
                    <td className="py-2.5 text-secondary">
                      {item.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border p-5">
        <h2 className="text-sm font-semibold text-primary">
          Create catalog entry
        </h2>
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="create-make">Make *</Label>
              <Input
                id="create-make"
                value={form.make}
                onChange={(e) =>
                  setForm((f) => ({ ...f, make: e.target.value }))
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="create-model">Model *</Label>
              <Input
                id="create-model"
                value={form.model}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="create-generation">Generation</Label>
              <Input
                id="create-generation"
                value={form.generation ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, generation: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-market">Market variant</Label>
              <Input
                id="create-market"
                value={form.market_variant ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, market_variant: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-year-start">Year start</Label>
              <Input
                id="create-year-start"
                type="number"
                min={0}
                value={form.year_start}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    year_start: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-year-end">Year end</Label>
              <Input
                id="create-year-end"
                type="number"
                min={0}
                value={form.year_end}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    year_end: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-engine">Engine</Label>
              <Input
                id="create-engine"
                value={form.engine ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, engine: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-trim">Trim</Label>
              <Input
                id="create-trim"
                value={form.trim ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, trim: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="create-notes">Catalog notes</Label>
              <Input
                id="create-notes"
                value={form.notes ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create entry"}
          </Button>
        </form>
      </section>
    </div>
  );
}
