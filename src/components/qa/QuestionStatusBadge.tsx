import { cn } from "@/lib/utils";
import type { QuestionStatus } from "@/types/qa";

const styles: Record<QuestionStatus, string> = {
  open: "bg-muted text-foreground",
  answered: "bg-primary/10 text-foreground ring-1 ring-primary/20",
  closed: "bg-muted/80 text-secondary",
};

const labels: Record<QuestionStatus, string> = {
  open: "Open",
  answered: "Answered",
  closed: "Closed",
};

export function QuestionStatusBadge({
  status,
  className,
}: {
  status: QuestionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-pill px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
