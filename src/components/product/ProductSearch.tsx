"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface ProductSearchProps {
  className?: string;
  placeholder?: string;
  /** When set, submit goes to this path with `search` and current search params (e.g. /products). */
  basePath?: string;
  /** Show a submit button next to the input. */
  showButton?: boolean;
}

export function ProductSearch({
  className,
  placeholder = "Search parts...",
  basePath,
  showButton = false,
}: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchFromUrl = basePath ? (searchParams.get("search") ?? "") : "";
  const [value, setValue] = useState(searchFromUrl);
  const debounced = useDebounce(value, 300);

  useEffect(() => {
    if (basePath) {
      setValue(searchParams.get("search") ?? "");
    }
  }, [basePath, searchParams.get("search")]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = value.trim() || debounced.trim();
    if (basePath) {
      const params = new URLSearchParams(searchParams.toString());
      if (term) params.set("search", term);
      else params.delete("search");
      params.set("page", "1");
      router.push(`${basePath}?${params.toString()}`);
    } else if (term) {
      router.push(`/search?search=${encodeURIComponent(term)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative flex gap-2", className)}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-10"
          aria-label="Search products"
        />
      </div>
      {showButton && (
        <Button type="submit" size="default">
          Search
        </Button>
      )}
    </form>
  );
}
