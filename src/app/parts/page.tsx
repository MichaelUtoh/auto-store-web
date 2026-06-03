import type { Metadata } from "next";
import { Suspense } from "react";
import { PartFinderHub } from "@/components/part-finder/PartFinderHub";

export const metadata: Metadata = {
  title: "Visual Part Finder | AutoParts",
  description:
    "Interactive exploded diagrams for brakes, suspension, and more. Click the component you need and shop matching parts.",
};

export default function PartsPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-16 text-secondary">Loading…</div>
      }
    >
      <PartFinderHub />
    </Suspense>
  );
}
