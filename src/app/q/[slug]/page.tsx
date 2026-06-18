import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuestionStatusBadge } from "@/components/qa/QuestionStatusBadge";
import { QuestionContextChips } from "@/components/qa/QuestionContextChips";
import { QuestionThreadActions } from "@/components/qa/QuestionThreadActions";
import { questionsApi } from "@/lib/api/questions";
import { buildQaPageJsonLd } from "@/lib/qa/jsonLd";
import { authorDisplayName } from "@/lib/utils/mapQaFromApi";
import { formatDateTime } from "@/lib/utils/format";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const question = await questionsApi.getBySlugServer(params.slug);
  if (!question) {
    return { title: "Question not found | 247CarKiosk Q&A" };
  }
  const description = question.body.slice(0, 160);
  return {
    title: `${question.title} | 247CarKiosk Q&A`,
    description,
    alternates: { canonical: `/q/${question.slug}` },
    ...(question.status === "closed"
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function QuestionThreadPage({ params }: Props) {
  const question = await questionsApi.getBySlugServer(params.slug);
  if (!question) notFound();

  const jsonLd = buildQaPageJsonLd(question);

  return (
    <article className="page-container py-6 sm:py-8">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <nav className="mb-6 text-sm text-secondary">
        <Link href="/q" className="hover:text-foreground">
          Community Q&A
        </Link>
        <span className="mx-2">/</span>
        <span className="line-clamp-1 font-medium text-foreground">
          {question.title}
        </span>
      </nav>

      <header className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="page-title flex-1">{question.title}</h1>
          <QuestionStatusBadge status={question.status} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
          <span>{authorDisplayName(question.author)}</span>
          <span>·</span>
          <time dateTime={question.createdAt}>
            {formatDateTime(question.createdAt)}
          </time>
          <span>·</span>
          <span>{question.viewCount} views</span>
        </div>
        <QuestionContextChips question={question} />
      </header>

      <div className="mt-8 rounded-3xl bg-muted/50 p-5 sm:p-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
          {question.body}
        </p>
      </div>

      <QuestionThreadActions initialQuestion={question} />
    </article>
  );
}
