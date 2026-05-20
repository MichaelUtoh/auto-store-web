import { Suspense } from "react";
import { ProductCatalog } from "@/components/shop/ProductCatalog";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="page-container py-16 text-secondary">Loading…</div>}>
      <ProductCatalog title="Most popular" basePath="/" showHero />
    </Suspense>
  );
}
