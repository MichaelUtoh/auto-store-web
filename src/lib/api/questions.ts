import { apiClient } from "./client";
import { serverGet } from "./serverFetch";
import type { ApiResponse } from "@/types/api";
import type {
  Answer,
  CreateQuestionInput,
  ListQuestionsParams,
  QuestionDetail,
  QuestionsListResult,
} from "@/types/qa";
import {
  createQuestionToApi,
  mapAnswerFromApi,
  mapQuestionDetailFromApi,
  parseQuestionsListResponse,
} from "@/lib/utils/mapQaFromApi";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

function buildQueryParams(
  params: ListQuestionsParams
): Record<string, string | number> {
  const qs: Record<string, string | number> = {};
  if (params.q) qs.q = params.q;
  if (params.productId) qs.product_id = params.productId;
  if (params.categoryId) qs.category_id = params.categoryId;
  if (params.make) qs.make = params.make;
  if (params.model) qs.model = params.model;
  if (params.year != null) qs.year = params.year;
  if (params.status) qs.status = params.status;
  if (params.page != null) qs.page = params.page;
  if (params.limit != null) qs.limit = params.limit;
  return qs;
}

export const questionsApi = {
  list: async (params: ListQuestionsParams = {}): Promise<QuestionsListResult> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>("/questions", {
      params: buildQueryParams(params),
    });
    return parseQuestionsListResponse(data);
  },

  getBySlug: async (slug: string): Promise<QuestionDetail> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(
      `/questions/${slug}`
    );
    return mapQuestionDetailFromApi(data);
  },

  /** SSR / sitemap — no auth, single fetch */
  getBySlugServer: async (slug: string): Promise<QuestionDetail | null> => {
    const body = await serverGet<unknown>(`/questions/${slug}`, {
      revalidate: 60,
      tags: [`question-${slug}`],
    });
    if (!body) return null;
    try {
      return mapQuestionDetailFromApi(body);
    } catch {
      return null;
    }
  },

  listServer: async (
    params: ListQuestionsParams = {}
  ): Promise<QuestionsListResult> => {
    const qs = new URLSearchParams();
    const built = buildQueryParams(params);
    Object.entries(built).forEach(([k, v]) => qs.set(k, String(v)));
    const body = await serverGet<unknown>(`/questions?${qs.toString()}`, {
      revalidate: 300,
    });
    if (!body) {
      return { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
    }
    return parseQuestionsListResponse(body);
  },

  listByProduct: async (
    productId: string,
    page = 1,
    limit = 5
  ): Promise<QuestionsListResult> => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(
      `/products/${productId}/questions`,
      { params: { page, limit } }
    );
    return parseQuestionsListResponse(data);
  },

  create: async (input: CreateQuestionInput): Promise<QuestionDetail> => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/questions",
      createQuestionToApi(input)
    );
    return mapQuestionDetailFromApi(data);
  },

  createAnswer: async (
    questionId: string,
    body: string
  ): Promise<Answer> => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/questions/${questionId}/answers`,
      { body }
    );
    const raw = unwrapApiDataBody(data);
    return mapAnswerFromApi(raw);
  },

  acceptAnswer: async (
    questionId: string,
    answerId: string
  ): Promise<QuestionDetail> => {
    const { data } = await apiClient.patch<ApiResponse<unknown>>(
      `/questions/${questionId}/accept-answer/${answerId}`
    );
    return mapQuestionDetailFromApi(data);
  },

  close: async (questionId: string): Promise<QuestionDetail> => {
    const { data } = await apiClient.patch<ApiResponse<unknown>>(
      `/questions/${questionId}/close`
    );
    return mapQuestionDetailFromApi(data);
  },
};
