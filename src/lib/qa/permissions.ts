import type { Answer, QuestionDetail } from "@/types/qa";
import type { User } from "@/types/user";

export function isVerifiedMechanic(user: User | null | undefined): boolean {
  return (
    user?.role === "MECHANIC" &&
    user.mechanicProfile?.isVerified === true
  );
}

export function canAnswerQuestion(
  user: User | null | undefined,
  question: QuestionDetail,
  answers: Answer[]
): boolean {
  if (!isVerifiedMechanic(user)) return false;
  if (question.status === "closed") return false;
  if (!user) return false;
  return !answers.some((a) => a.author.id === user.id);
}

export function isQuestionAuthor(
  user: User | null | undefined,
  question: QuestionDetail
): boolean {
  return Boolean(user && user.id === question.author.id);
}

export function canAcceptAnswer(
  user: User | null | undefined,
  question: QuestionDetail
): boolean {
  return isQuestionAuthor(user, question) && question.status !== "closed";
}

export function canCloseQuestion(
  user: User | null | undefined,
  question: QuestionDetail
): boolean {
  if (!user) return false;
  return (
    user.role === "ADMIN" || isQuestionAuthor(user, question)
  );
}
