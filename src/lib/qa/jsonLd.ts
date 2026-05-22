import type { QuestionDetail } from "@/types/qa";
import { authorDisplayName } from "@/lib/utils/mapQaFromApi";

export function buildQaPageJsonLd(question: QuestionDetail): object | null {
  if (question.answers.length === 0) return null;

  const accepted = question.answers.find((a) => a.isAccepted);
  const suggested = question.answers.filter((a) => !a.isAccepted);

  const mapAnswer = (a: (typeof question.answers)[0]) => ({
    "@type": "Answer",
    text: a.body,
    dateCreated: a.createdAt,
    author: {
      "@type": "Person",
      name:
        a.isVerifiedMechanic && a.author.mechanicProfile
          ? `${authorDisplayName(a.author)} (${a.author.mechanicProfile.businessName})`
          : authorDisplayName(a.author),
    },
    ...(a.isAccepted ? { upvoteCount: 1 } : {}),
  });

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question.title,
      text: question.body,
      dateCreated: question.createdAt,
      author: {
        "@type": "Person",
        name: authorDisplayName(question.author),
      },
      answerCount: question.answerCount,
      ...(accepted
        ? { acceptedAnswer: mapAnswer(accepted) }
        : {}),
      ...(suggested.length > 0
        ? { suggestedAnswer: suggested.map(mapAnswer) }
        : {}),
    },
  };
}
