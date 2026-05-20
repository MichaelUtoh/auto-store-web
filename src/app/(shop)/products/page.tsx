import { Suspense } from "react";
import { ProductCatalog } from "@/components/shop/ProductCatalog";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="page-container py-16 text-secondary">Loading…</div>}>
      <ProductCatalog title="Products" basePath="/products" />
    </Suspense>
  );
}
