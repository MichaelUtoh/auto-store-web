"use client";

import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProductFilterProps {
  categories?: { id: string; name: string; slug: string }[];
  className?: string;
}

export function ProductFilter({ categories = [], className }: ProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  return (
    <aside
      className={cn(
        "space-y-6 rounded-lg border border-gray-200 bg-surface p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear all
        </Button>
      </div>

      {categories.length > 0 && (
        <div>
          <Label className="mb-2 block">Category</Label>
          <select
            className="w-full rounded-md border border-gray-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            value={category}
            onChange={(e) => updateParams({ category: e.target.value })}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug ?? c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label className="mb-2 block">Price range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={minPrice}
            onChange={(e) => updateParams({ minPrice: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={maxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Sort by</Label>
        <select
          className="w-full rounded-md border border-gray-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
