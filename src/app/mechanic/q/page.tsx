"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/qa/QuestionCard";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { questionsApi } from "@/lib/api/questions";
import { useAuthStore } from "@/store/useAuthStore";
import { isVerifiedMechanic } from "@/lib/qa/permissions";
import type { QuestionListItem } from "@/types/qa";

export default function MechanicQuestionsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const verified = isVerifiedMechanic(user);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await questionsApi.list({ status: "open", page, limit: 20 });
      setQuestions(res.items);
      setCurrentPage(res.page);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/mechanic/q");
      return;
    }
    if (!verified) return;
    load(1);
  }, [hasHydrated, isAuthenticated, verified, router, load]);

  if (!hasHydrated) {
    return (
      <div className="page-container py-16 text-center text-secondary">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page-container py-16 text-center text-secondary">
        Redirecting…
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="page-container max-w-lg py-16 text-center">
        <h1 className="page-title">Mechanic Q&A</h1>
        <p className="mt-4 text-secondary">
          Only verified mechanics can answer community questions. Complete your
          mechanic verification to participate.
        </p>
        <Button asChild className="mt-6">
          <Link href="/account/profile">View profile</Link>
        </Button>
        <Button asChild variant="outline" className="mt-3">
          <Link href="/q">Browse questions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container py-6 sm:py-8">
      <h1 className="page-title">Open questions</h1>
      <p className="mt-2 text-sm text-secondary">
        Answer one question per thread. You&apos;ll earn trust with the verified
        mechanic badge.
      </p>

      <div className="mt-8">
        {loading ? (
          <p className="text-center text-secondary py-12">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="rounded-3xl bg-muted py-12 text-center text-secondary">
            No open questions right now.
          </p>
        ) : (
          <div className="grid gap-4">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/mechanic/q"
        />
      </div>
    </div>
  );
}
