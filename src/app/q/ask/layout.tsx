import { Suspense } from "react";

export default function AskQuestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="page-container max-w-2xl py-16 text-secondary">
          Loading…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
