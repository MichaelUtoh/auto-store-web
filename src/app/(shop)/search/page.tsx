import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-container py-16 text-secondary">Loading…</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
