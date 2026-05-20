"use client";

import Link from "next/link";
import { Wrench, Car, Gauge, Settings, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const iconPool = [Wrench, Car, Gauge, Settings, Package];

interface CategoryScrollerProps {
  categories: { id: string; name: string; slug: string }[];
  className?: string;
}

export function CategoryScroller({ categories, className }: CategoryScrollerProps) {
  const items = categories.filter((c) => c.slug?.trim()).slice(0, 8);

  if (items.length === 0) return null;

  return (
    <div className={cn("scrollbar-hide -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6", className)}>
      <div className="flex gap-4 pb-1">
        {items.map((cat, i) => {
          const Icon = iconPool[i % iconPool.length];
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80 sm:h-[4.5rem] sm:w-[4.5rem]">
                <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
              <span className="max-w-[4.5rem] truncate text-center text-xs font-medium text-primary">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
