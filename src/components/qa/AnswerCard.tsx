"use client";

import { Button } from "@/components/ui/button";
import { VerifiedMechanicBadge } from "./VerifiedMechanicBadge";
import { authorDisplayName } from "@/lib/utils/mapQaFromApi";
import { formatDateTime } from "@/lib/utils/format";
import type { Answer } from "@/types/qa";
import { cn } from "@/lib/utils";

interface AnswerCardProps {
  answer: Answer;
  showAccept?: boolean;
  onAccept?: (answerId: string) => void;
  acceptingId?: string | null;
}

export function AnswerCard({
  answer,
  showAccept,
  onAccept,
  acceptingId,
}: AnswerCardProps) {
  return (
    <article
      className={cn(
        "rounded-3xl border border-border bg-surface p-5 shadow-card",
        answer.isAccepted && "ring-2 ring-primary/15"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-foreground">
          {authorDisplayName(answer.author)}
        </p>
        {answer.isVerifiedMechanic && answer.author.mechanicProfile && (
          <VerifiedMechanicBadge profile={answer.author.mechanicProfile} />
        )}
        {answer.isAccepted && (
          <span className="rounded-pill bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            Accepted answer
          </span>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {answer.body}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <time className="text-xs text-secondary" dateTime={answer.createdAt}>
          {formatDateTime(answer.createdAt)}
        </time>
        {showAccept && !answer.isAccepted && onAccept && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={acceptingId === answer.id}
            onClick={() => onAccept(answer.id)}
          >
            {acceptingId === answer.id ? "Accepting…" : "Accept"}
          </Button>
        )}
      </div>
    </article>
  );
}
