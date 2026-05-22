"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { QuestionStatusBadge } from "./QuestionStatusBadge";
import { questionsApi } from "@/lib/api/questions";
import { formatRelativeDate } from "@/lib/utils/format";
import type { QuestionListItem } from "@/types/qa";

export function ProductQuestionsSection({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    questionsApi
      .listByProduct(productId, 1, 5)
      .then((res) => setQuestions(res.items))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [productId]);

  const askHref = `/q/ask?product_id=${encodeURIComponent(productId)}`;

  return (
    <section className="mt-14 border-t border-border pt-10 sm:mt-16">
      <SectionHeader
        title="Questions & answers"
        href={`/q?product_id=${productId}`}
        linkLabel="View all"
        className="mb-2"
      />
      <p className="mb-6 text-sm text-secondary">
        Fitment and install questions from the community — separate from customer
        reviews.
      </p>

      {loading ? (
        <p className="text-sm text-secondary">Loading questions…</p>
      ) : questions.length === 0 ? (
        <div className="rounded-3xl bg-muted px-6 py-10 text-center">
          <MessageCircleQuestion
            className="mx-auto h-10 w-10 text-secondary"
            strokeWidth={1.5}
          />
          <p className="mt-3 text-sm text-secondary">
            No questions yet — be the first to ask about this product.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link href={askHref}>Ask about this product</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {questions.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/q/${q.slug}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/60 px-4 py-3 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground line-clamp-1">
                      {q.title}
                    </p>
                    <p className="mt-0.5 text-xs text-secondary">
                      {q.answerCount}{" "}
                      {q.answerCount === 1 ? "answer" : "answers"} ·{" "}
                      {formatRelativeDate(q.createdAt)}
                    </p>
                  </div>
                  <QuestionStatusBadge status={q.status} />
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-4" size="sm">
            <Link href={askHref}>Ask about this product</Link>
          </Button>
        </>
      )}
    </section>
  );
}
