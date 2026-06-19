"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { productsApi } from "@/lib/api/products";
import { vehicleCompatibilitiesApi } from "@/lib/api/vehicleCompatibilities";
import type {
  ProductVehicleCompatibility,
  VehicleCompatibilityCatalog,
  VehicleCompatibilityCreateInput,
} from "@/types/vehicleCompatibility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { VehicleCompatibilityTable } from "@/components/vehicle/VehicleCompatibilityTable";
import { formatCompatibilityLabel } from "@/lib/utils/mapVehicleCompatibilityFromApi";
import toast from "react-hot-toast";

const emptyInlineCreate = (): VehicleCompatibilityCreateInput => ({
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

interface AdminProductCompatibilityPickerProps {
  productId: string;
}

export function AdminProductCompatibilityPicker({
  productId,
}: AdminProductCompatibilityPickerProps) {
  const [linked, setLinked] = useState<ProductVehicleCompatibility[]>([]);
  const [catalog, setCatalog] = useState<VehicleCompatibilityCatalog[]>([]);
  const [loadingLinked, setLoadingLinked] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [linking, setLinking] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [createForm, setCreateForm] = useState(emptyInlineCreate);
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    market_variant: "",
  });

  const linkedIds = useMemo(
    () => new Set(linked.map((item) => item.id)),
    [linked]
  );

  const loadLinked = useCallback(async () => {
    setLoadingLinked(true);
    try {
      const rows = await productsApi.getProductCompatibility(productId);
      setLinked(rows);
    } catch {
      toast.error("Failed to load linked fitment.");
      setLinked([]);
    } finally {
      setLoadingLinked(false);
    }
  }, [productId]);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const rows = await vehicleCompatibilitiesApi.list({
        make: filters.make.trim() || undefined,
        model: filters.model.trim() || undefined,
        market_variant: filters.market_variant.trim() || undefined,
        limit: 200,
      });
      setCatalog(rows);
    } catch {
      toast.error("Failed to load compatibility catalog.");
      setCatalog([]);
    } finally {
      setLoadingCatalog(false);
    }
  }, [filters.make, filters.model, filters.market_variant]);

  useEffect(() => {
    if (productId) loadLinked();
  }, [productId, loadLinked]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const linkSelected = async () => {
    const ids = Array.from(selectedIds).filter((id) => !linkedIds.has(id));
    if (ids.length === 0) {
      toast.error("Select catalog entries that are not already linked.");
      return;
    }
    setLinking(true);
    try {
      await productsApi.linkProductCompatibility(productId, {
        compatibility_ids: ids,
      });
      await loadLinked();
      setSelectedIds(new Set());
      toast.success("Fitment linked to product.");
    } catch {
      toast.error("Failed to link fitment.");
    } finally {
      setLinking(false);
    }
  };

  const createAndLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.make.trim() || !createForm.model.trim()) {
      toast.error("Make and model are required.");
      return;
    }
    setLinking(true);
    try {
      await productsApi.linkProductCompatibility(productId, {
        compatibilities: [
          {
            ...createForm,
            make: createForm.make.trim(),
            model: createForm.model.trim(),
            generation: createForm.generation?.trim() ?? "",
            year_start: Number(createForm.year_start) || 0,
            year_end: Number(createForm.year_end) || 0,
            engine: createForm.engine?.trim() ?? "",
            trim: createForm.trim?.trim() ?? "",
            market_variant: createForm.market_variant?.trim() ?? "",
            notes: createForm.notes?.trim() ?? "",
          },
        ],
      });
      await loadLinked();
      await loadCatalog();
      setCreateForm(emptyInlineCreate());
      setShowCreateLink(false);
      toast.success("Catalog entry created and linked.");
    } catch {
      toast.error("Failed to create and link fitment.");
    } finally {
      setLinking(false);
    }
  };

  const selectableCatalog = catalog.filter((item) => !linkedIds.has(item.id));

  return (
    <section className="space-y-6 rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary">Vehicle fitment</h2>
          <p className="mt-1 text-sm text-secondary">
            Link global catalog entries to this product. Manage the catalog on{" "}
            <Link
              href="/admin/vehicle-compatibilities"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Vehicle compatibilities
            </Link>
            .
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-primary">Linked fitment</h3>
        {loadingLinked ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mt-3">
            <VehicleCompatibilityTable
              items={linked}
              emptyMessage="No fitment linked yet. Pick from the catalog below."
            />
          </div>
        )}
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-primary">
          Add from catalog
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Input
            placeholder="Filter make"
            value={filters.make}
            onChange={(e) =>
              setFilters((f) => ({ ...f, make: e.target.value }))
            }
          />
          <Input
            placeholder="Filter model"
            value={filters.model}
            onChange={(e) =>
              setFilters((f) => ({ ...f, model: e.target.value }))
            }
          />
          <Input
            placeholder="Market variant"
            value={filters.market_variant}
            onChange={(e) =>
              setFilters((f) => ({ ...f, market_variant: e.target.value }))
            }
          />
          <Button type="button" variant="outline" onClick={loadCatalog}>
            Search catalog
          </Button>
        </div>

        {loadingCatalog ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : selectableCatalog.length === 0 ? (
          <p className="mt-4 text-sm text-secondary">
            No unlinked catalog entries match filters.
          </p>
        ) : (
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
            {selectableCatalog.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    <span className="font-medium text-primary">
                      {formatCompatibilityLabel(item)}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs text-secondary">
                      {item.id}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={linkSelected}
            disabled={linking || selectedIds.size === 0}
          >
            {linking ? "Linking…" : "Link selected"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCreateLink((v) => !v)}
          >
            {showCreateLink ? "Hide create & link" : "Create & link new entry"}
          </Button>
        </div>
      </div>

      {showCreateLink && (
        <form
          onSubmit={createAndLink}
          className="space-y-4 border-t border-border pt-5"
        >
          <h3 className="text-sm font-semibold text-primary">
            Create catalog entry and link
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="plink-make">Make *</Label>
              <Input
                id="plink-make"
                value={createForm.make}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, make: e.target.value }))
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="plink-model">Model *</Label>
              <Input
                id="plink-model"
                value={createForm.model}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, model: e.target.value }))
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="plink-generation">Generation</Label>
              <Input
                id="plink-generation"
                value={createForm.generation ?? ""}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, generation: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="plink-market">Market variant</Label>
              <Input
                id="plink-market"
                value={createForm.market_variant ?? ""}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    market_variant: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="plink-year-start">Year start</Label>
              <Input
                id="plink-year-start"
                type="number"
                min={0}
                value={createForm.year_start}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    year_start: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="plink-year-end">Year end</Label>
              <Input
                id="plink-year-end"
                type="number"
                min={0}
                value={createForm.year_end}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    year_end: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="plink-engine">Engine</Label>
              <Input
                id="plink-engine"
                value={createForm.engine ?? ""}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, engine: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="plink-trim">Trim</Label>
              <Input
                id="plink-trim"
                value={createForm.trim ?? ""}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, trim: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="plink-notes">Catalog notes</Label>
              <Input
                id="plink-notes"
                value={createForm.notes ?? ""}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <Button type="submit" disabled={linking}>
            {linking ? "Saving…" : "Create & link"}
          </Button>
        </form>
      )}
    </section>
  );
}
