export type QuestionStatus = "open" | "answered" | "closed";

export interface QuestionAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface MechanicProfileSummary {
  id: string;
  status: string;
  businessName: string;
  isVerified: boolean;
}

export interface AnswerAuthor {
  id: string;
  firstName: string;
  lastName: string;
  mechanicProfile?: MechanicProfileSummary;
}

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  isAccepted: boolean;
  isVerifiedMechanic: boolean;
  author: AnswerAuthor;
  createdAt: string;
}

export interface QuestionListItem {
  id: string;
  title: string;
  slug: string;
  status: QuestionStatus;
  viewCount: number;
  productId?: string;
  categoryId?: string;
  make?: string;
  model?: string;
  year?: number;
  author: QuestionAuthor;
  answerCount: number;
  acceptedAnswer?: Answer;
  createdAt: string;
}

export interface QuestionDetail extends QuestionListItem {
  body: string;
  answers: Answer[];
  updatedAt: string;
}

export interface CreateQuestionInput {
  title: string;
  body: string;
  productId?: string;
  categoryId?: string;
  make?: string;
  model?: string;
  year?: number;
}

export interface ListQuestionsParams {
  q?: string;
  productId?: string;
  categoryId?: string;
  make?: string;
  model?: string;
  year?: number;
  status?: QuestionStatus;
  page?: number;
  limit?: number;
}

export interface QuestionsListResult {
  items: QuestionListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
