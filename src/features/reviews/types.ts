export type ReviewId = string;

export type ReviewInteraction = "like" | "spoiler" | "well_argued";

export type ReviewHighlight =
  | "soundtrack"
  | "cinematography"
  | "screenplay"
  | "acting"
  | "direction"
  | "visual_effects";

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
  authorName: string;
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

export const REVIEW_HIGHLIGHT_LABELS: Record<ReviewHighlight, string> = {
  soundtrack: "Trilha Sonora",
  cinematography: "Fotografia",
  screenplay: "Roteiro",
  acting: "Atuação",
  direction: "Direção",
  visual_effects: "Efeitos Especiais",
};

export const REVIEW_SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "well_argued", label: "Mais bem argumentadas" },
  { value: "most_liked", label: "Mais curtidas" },
  { value: "newest", label: "Mais recentes" },
  { value: "rating_desc", label: "Maior nota" },
  { value: "rating_asc", label: "Menor nota" },
];
