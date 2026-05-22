"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AnswerCard } from "./AnswerCard";
import { questionsApi } from "@/lib/api/questions";
import { useAuthStore } from "@/store/useAuthStore";
import {
  canAcceptAnswer,
  canAnswerQuestion,
  canCloseQuestion,
  isVerifiedMechanic,
} from "@/lib/qa/permissions";
import type { QuestionDetail } from "@/types/qa";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface QuestionThreadActionsProps {
  initialQuestion: QuestionDetail;
}

export function QuestionThreadActions({
  initialQuestion,
}: QuestionThreadActionsProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [question, setQuestion] = useState(initialQuestion);
  const [answerBody, setAnswerBody] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const showAnswerForm = canAnswerQuestion(user, question, question.answers);
  const showAccept = canAcceptAnswer(user, question);
  const showClose = canCloseQuestion(user, question);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = answerBody.trim();
    if (body.length < 10) {
      toast.error("Answer must be at least 10 characters");
      return;
    }
    setSubmittingAnswer(true);
    try {
      await questionsApi.createAnswer(question.id, body);
      toast.success("Answer posted");
      setAnswerBody("");
      const updated = await questionsApi.getBySlug(question.slug);
      setQuestion(updated);
      router.refresh();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; error?: string }>;
      const msg =
        axiosErr.response?.data?.message ??
        axiosErr.response?.data?.error ??
        "Could not post answer";
      if (axiosErr.response?.status === 403) {
        toast.error("Only verified mechanics can answer questions.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAccept = async (answerId: string) => {
    setAcceptingId(answerId);
    try {
      const updated = await questionsApi.acceptAnswer(question.id, answerId);
      setQuestion(updated);
      toast.success("Answer accepted");
      router.refresh();
    } catch {
      toast.error("Could not accept answer");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleClose = async () => {
    if (!confirm("Close this thread? No new answers will be allowed.")) return;
    setClosing(true);
    try {
      const updated = await questionsApi.close(question.id);
      setQuestion(updated);
      toast.success("Thread closed");
      router.refresh();
    } catch {
      toast.error("Could not close thread");
    } finally {
      setClosing(false);
    }
  };

  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return 0;
  });

  return (
    <div className="mt-8 space-y-6">
      <h2 className="section-title">
        {question.answerCount}{" "}
        {question.answerCount === 1 ? "Answer" : "Answers"}
      </h2>

      {sortedAnswers.length === 0 ? (
        <p className="rounded-3xl bg-muted px-6 py-8 text-center text-sm text-secondary">
          No answers yet.
          {!isAuthenticated && " Log in as a verified mechanic to respond."}
        </p>
      ) : (
        <div className="space-y-4">
          {sortedAnswers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              showAccept={showAccept}
              onAccept={handleAccept}
              acceptingId={acceptingId}
            />
          ))}
        </div>
      )}

      {showAnswerForm && (
        <form
          onSubmit={handlePostAnswer}
          className="rounded-3xl border border-border bg-muted/40 p-5"
        >
          <Label htmlFor="answer-body" className="text-base">
            Your answer
          </Label>
          <textarea
            id="answer-body"
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            rows={5}
            className="input-field mt-2 min-h-[120px] resize-y"
            placeholder="Share fitment or install guidance…"
            disabled={submittingAnswer}
          />
          <Button
            type="submit"
            className="mt-4"
            disabled={submittingAnswer || answerBody.trim().length < 10}
          >
            {submittingAnswer ? "Posting…" : "Post answer"}
          </Button>
        </form>
      )}

      {!isAuthenticated && question.status !== "closed" && (
        <p className="text-sm text-secondary">
          <Link href={`/login?redirect=/q/${question.slug}`} className="font-medium text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>{" "}
          to ask follow-ups.{" "}
          <Link href="/mechanic/q" className="font-medium text-foreground underline-offset-4 hover:underline">
            Mechanics
          </Link>{" "}
          can apply to answer.
        </p>
      )}

      {isAuthenticated && !isVerifiedMechanic(user) && question.status !== "closed" && (
        <p className="text-sm text-secondary">
          <Link href="/mechanic/q" className="font-medium text-foreground underline-offset-4 hover:underline">
            Apply as a verified mechanic
          </Link>{" "}
          to answer community questions.
        </p>
      )}

      {showClose && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={closing}
        >
          {closing ? "Closing…" : "Close thread"}
        </Button>
      )}
    </div>
  );
}
