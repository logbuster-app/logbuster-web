import { HIGHLIGHT_LABELS, type Highlight } from "@/shared/lib/highlights";

export type ReviewId = string;

export type ReviewInteraction = "like" | "spoiler" | "well_argued";

/** Os nomes dos destaques vivem em `shared/lib/highlights` e são reexportados aqui. */
export type ReviewHighlight = Highlight;

export type ReviewSort =
  | "well_argued"
  | "most_liked"
  | "newest"
  | "rating_desc"
  | "rating_asc";

export type Review = {
  id: ReviewId;
  movieId: string;
  authorName: string;
  rating: number; // 0.5 a 5.0
  content: string;
  isSpoiler: boolean;
  highlights: ReviewHighlight[];
  counts: {
    like: number;
    spoiler: number;
    wellArgued: number;
  };
  viewerInteractions: ReviewInteraction[];
  createdAt: string;
};

export type CreateReviewInput = {
  movieId: string;
  rating: number;
  content: string;
  isSpoiler: boolean;
  highlights: ReviewHighlight[];
};

export type ReviewListPage = {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
  sort: ReviewSort;
};

export const REVIEW_HIGHLIGHT_LABELS: Record<ReviewHighlight, string> = HIGHLIGHT_LABELS;

export const REVIEW_SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "well_argued", label: "Mais bem argumentadas" },
  { value: "most_liked", label: "Mais curtidas" },
  { value: "newest", label: "Mais recentes" },
  { value: "rating_desc", label: "Maior nota" },
  { value: "rating_asc", label: "Menor nota" },
];

/**
 * Votos de spoiler da comunidade que ocultam uma avaliação sem marcação (CR-02).
 * Deve ser igual ao limiar usado pelo backend no resumo da comunidade.
 */
export const SPOILER_VOTE_THRESHOLD = 10;

/** Resumo da comunidade gerado por IA (GET /movies/{id}/review-summary). */
export type ReviewSummary =
  | { status: "ready"; text: string; generatedAt: string }
  | { status: "insufficient_reviews" }
  | { status: "unavailable" };

export type UserReviewListPage = {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
};
