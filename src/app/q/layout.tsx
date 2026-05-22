import { Suspense } from "react";

export default function QaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="page-container py-16 text-secondary">Loading…</div>
      }
    >
      {children}
    </Suspense>
  );
}
