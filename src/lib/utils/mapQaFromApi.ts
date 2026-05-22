import type {
  Answer,
  AnswerAuthor,
  CreateQuestionInput,
  QuestionDetail,
  QuestionListItem,
  QuestionStatus,
  QuestionsListResult,
} from "@/types/qa";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

function mapMechanicProfile(raw: unknown) {
  if (!raw || typeof raw !== "object") return undefined;
  const p = raw as Record<string, unknown>;
  return {
    id: String(p.id ?? ""),
    status: String(p.status ?? ""),
    businessName: String(p.business_name ?? p.businessName ?? ""),
    isVerified: Boolean(p.is_verified ?? p.isVerified),
  };
}

function mapAuthor(raw: unknown): AnswerAuthor {
  const a = raw as Record<string, unknown>;
  return {
    id: String(a.id ?? ""),
    firstName: String(a.first_name ?? a.firstName ?? ""),
    lastName: String(a.last_name ?? a.lastName ?? ""),
    mechanicProfile: mapMechanicProfile(a.mechanic_profile ?? a.mechanicProfile),
  };
}

export function mapAnswerFromApi(raw: unknown): Answer {
  const a = raw as Record<string, unknown>;
  return {
    id: String(a.id ?? ""),
    questionId: String(a.question_id ?? a.questionId ?? ""),
    body: String(a.body ?? ""),
    isAccepted: Boolean(a.is_accepted ?? a.isAccepted),
    isVerifiedMechanic: Boolean(
      a.is_verified_mechanic ?? a.isVerifiedMechanic
    ),
    author: mapAuthor(a.author),
    createdAt: String(a.created_at ?? a.createdAt ?? ""),
  };
}

export function mapQuestionListItemFromApi(raw: unknown): QuestionListItem {
  const q = raw as Record<string, unknown>;
  const accepted = q.accepted_answer ?? q.acceptedAnswer;
  return {
    id: String(q.id ?? ""),
    title: String(q.title ?? ""),
    slug: String(q.slug ?? ""),
    status: (q.status as QuestionStatus) ?? "open",
    viewCount: Number(q.view_count ?? q.viewCount ?? 0),
    productId: (q.product_id ?? q.productId) as string | undefined,
    categoryId: (q.category_id ?? q.categoryId) as string | undefined,
    make: q.make as string | undefined,
    model: q.model as string | undefined,
    year: q.year != null ? Number(q.year) : undefined,
    author: {
      id: String((q.author as Record<string, unknown>)?.id ?? ""),
      firstName: String(
        (q.author as Record<string, unknown>)?.first_name ??
          (q.author as Record<string, unknown>)?.firstName ??
          ""
      ),
      lastName: String(
        (q.author as Record<string, unknown>)?.last_name ??
          (q.author as Record<string, unknown>)?.lastName ??
          ""
      ),
    },
    answerCount: Number(q.answer_count ?? q.answerCount ?? 0),
    acceptedAnswer: accepted ? mapAnswerFromApi(accepted) : undefined,
    createdAt: String(q.created_at ?? q.createdAt ?? ""),
  };
}

export function mapQuestionDetailFromApi(raw: unknown): QuestionDetail {
  const q = unwrapApiDataBody(raw) ?? raw;
  const base = mapQuestionListItemFromApi(q);
  const d = q as Record<string, unknown>;
  const answersRaw = d.answers;
  const answers = Array.isArray(answersRaw)
    ? answersRaw.map(mapAnswerFromApi)
    : [];
  return {
    ...base,
    body: String(d.body ?? ""),
    answers,
    updatedAt: String(d.updated_at ?? d.updatedAt ?? base.createdAt),
  };
}

export function parseQuestionsListResponse(body: unknown): QuestionsListResult {
  const unwrapped = unwrapApiDataBody(body);
  const root = (body ?? {}) as Record<string, unknown>;
  const meta = (root.meta ?? {}) as Record<string, unknown>;

  let items: unknown[] = [];
  if (Array.isArray(unwrapped)) {
    items = unwrapped;
  } else if (unwrapped && typeof unwrapped === "object") {
    const o = unwrapped as Record<string, unknown>;
    if (Array.isArray(o.data)) items = o.data;
    else if (Array.isArray(o.items)) items = o.items;
  }

  const page = Number(meta.page ?? 1);
  const limit = Number(meta.limit ?? 20);
  const total = Number(meta.total ?? items.length);
  const totalPages = Number(
    meta.total_pages ??
      meta.totalPages ??
      (Math.ceil(total / limit) || 1)
  );

  return {
    items: items.map(mapQuestionListItemFromApi),
    page,
    limit,
    total,
    totalPages,
  };
}

export function createQuestionToApi(input: CreateQuestionInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: input.title,
    body: input.body,
  };
  if (input.productId) body.product_id = input.productId;
  if (input.categoryId) body.category_id = input.categoryId;
  if (input.make) body.make = input.make;
  if (input.model) body.model = input.model;
  if (input.year != null) body.year = input.year;
  return body;
}

export function authorDisplayName(author: {
  firstName: string;
  lastName: string;
}): string {
  const name = `${author.firstName} ${author.lastName}`.trim();
  return name || "Community member";
}
