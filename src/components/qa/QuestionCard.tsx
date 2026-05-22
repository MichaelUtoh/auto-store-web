import Link from "next/link";
import { QuestionStatusBadge } from "./QuestionStatusBadge";
import { authorDisplayName } from "@/lib/utils/mapQaFromApi";
import { formatRelativeDate } from "@/lib/utils/format";
import type { QuestionListItem } from "@/types/qa";

export function QuestionCard({ question }: { question: QuestionListItem }) {
  const excerpt =
    question.acceptedAnswer?.body ??
    (question.answerCount > 0 ? null : "No answers yet");

  return (
    <Link
      href={`/q/${question.slug}`}
      className="block rounded-3xl border border-border bg-surface p-5 shadow-card transition-shadow hover:shadow-soft"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2">
          {question.title}
        </h3>
        <QuestionStatusBadge status={question.status} />
      </div>
      {excerpt && (
        <p className="mt-2 line-clamp-2 text-sm text-secondary">{excerpt}</p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-secondary">
        <span>{authorDisplayName(question.author)}</span>
        <span>·</span>
        <span>
          {question.answerCount}{" "}
          {question.answerCount === 1 ? "answer" : "answers"}
        </span>
        <span>·</span>
        <span>{question.viewCount} views</span>
        <span>·</span>
        <span>{formatRelativeDate(question.createdAt)}</span>
      </div>
    </Link>
  );
}
