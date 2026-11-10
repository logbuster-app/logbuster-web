import type { CreateReviewInput, ReviewHighlight } from "./types";

/** Limites do formulário de avaliação (SPEC-FRONT-04, espelham o contrato do BACK-01). */
export const REVIEW_LIMITS = {
  minRating: 0.5,
  maxRating: 5,
  authorName: { min: 2, max: 50 },
  content: { min: 10, max: 2000 },
  maxHighlights: 2,
} as const;

export type ReviewFormValues = {
  movieId: string;
  rating: number | null;
  authorName: string;
  content: string;
  isSpoiler: boolean;
  highlights: ReviewHighlight[];
};

export type ReviewValidationResult =
  | { ok: true; input: CreateReviewInput }
  | { ok: false; error: string };

/** Valida o formulário e devolve o payload normalizado (com `trim`) pronto para o service. */
export function validateReview(values: ReviewFormValues): ReviewValidationResult {
  const { rating } = values;
  const authorName = values.authorName.trim();
  const content = values.content.trim();
  const { authorName: nameLimit, content: contentLimit } = REVIEW_LIMITS;

  if (
    rating === null ||
    rating < REVIEW_LIMITS.minRating ||
    rating > REVIEW_LIMITS.maxRating ||
    (rating * 2) % 1 !== 0
  ) {
    return { ok: false, error: "Selecione uma nota entre 0,5 e 5,0 estrelas." };
  }
  if (authorName.length < nameLimit.min || authorName.length > nameLimit.max) {
    return { ok: false, error: "O nome deve ter entre 2 e 50 caracteres." };
  }
  if (content.length < contentLimit.min || content.length > contentLimit.max) {
    return { ok: false, error: "A análise deve ter entre 10 e 2000 caracteres." };
  }
  if (values.highlights.length > REVIEW_LIMITS.maxHighlights) {
    return { ok: false, error: "Escolha no máximo 2 pontos de destaque." };
  }

  return {
    ok: true,
    input: {
      movieId: values.movieId,
      rating,
      authorName,
      content,
      isSpoiler: values.isSpoiler,
      highlights: values.highlights,
    },
  };
}
