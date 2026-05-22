import Link from "next/link";
import type { QuestionListItem } from "@/types/qa";

export function QuestionContextChips({
  question,
}: {
  question: Pick<
    QuestionListItem,
    "productId" | "make" | "model" | "year"
  >;
}) {
  if (question.productId) {
    return (
      <Link
        href={`/products/${question.productId}`}
        className="inline-flex rounded-pill bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/80"
      >
        View product
      </Link>
    );
  }
  if (question.make && question.model) {
    const vehicle = [question.year, question.make, question.model]
      .filter(Boolean)
      .join(" ");
    return (
      <span className="inline-flex rounded-pill bg-muted px-3 py-1 text-xs font-medium text-secondary">
        {vehicle}
      </span>
    );
  }
  return null;
}
