"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = "/products",
  className,
}: PaginationProps) {
  const searchParams = useSearchParams();

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn("flex items-center justify-center gap-2", className)}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <Link href={buildUrl(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      <span className="px-4 text-sm text-secondary">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <Link href={buildUrl(currentPage + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
