import { parseUtcDate } from "@/shared/lib/format";
import type { Review, ReviewHighlight } from "./types";

export const MIN_TIME_MACHINE_REVIEWS = 3;

/**
 * Ordem oficial dos destaques usada como critério de desempate (SPEC-FRONT-10 RN-05):
 * Trilha Sonora, Fotografia, Roteiro, Atuação, Direção, Efeitos Especiais.
 */
export const OFFICIAL_HIGHLIGHT_ORDER: readonly ReviewHighlight[] = [
  "soundtrack",
  "cinematography",
  "screenplay",
  "acting",
  "direction",
  "visual_effects",
];

export type TimeMachineStats = {
  ratedMoviesCount: number;
  ratingAvg: number;
  topHighlight: { highlight: ReviewHighlight; count: number } | null;
  topMovie: { movieId: string; rating: number };
};

/**
 * Calcula as estatísticas puras da Máquina do Tempo a partir do histórico público.
 * Retorna `null` abaixo de 3 avaliações (RN-02 / RN-05).
 */
export function computeTimeMachine(reviews: readonly Review[]): TimeMachineStats | null {
  if (reviews.length < MIN_TIME_MACHINE_REVIEWS) {
    return null;
  }

  const distinctMovies = new Set<string>();
  let ratingSum = 0;

  const highlightCounts = new Map<ReviewHighlight, number>();
  for (const h of OFFICIAL_HIGHLIGHT_ORDER) {
    highlightCounts.set(h, 0);
  }

  let bestMovieReview = reviews[0];
  let bestMovieTime = parseUtcDate(bestMovieReview.createdAt)?.getTime() ?? 0;

  for (const review of reviews) {
    distinctMovies.add(review.movieId);
    ratingSum += review.rating;

    for (const highlight of new Set(review.highlights)) {
      if (highlightCounts.has(highlight)) {
        highlightCounts.set(highlight, (highlightCounts.get(highlight) ?? 0) + 1);
      }
    }

    const reviewTime = parseUtcDate(review.createdAt)?.getTime() ?? 0;
    if (
      review.rating > bestMovieReview.rating ||
      (review.rating === bestMovieReview.rating && reviewTime > bestMovieTime)
    ) {
      bestMovieReview = review;
      bestMovieTime = reviewTime;
    }
  }

  let topHighlight: { highlight: ReviewHighlight; count: number } | null = null;
  for (const highlight of OFFICIAL_HIGHLIGHT_ORDER) {
    const count = highlightCounts.get(highlight) ?? 0;
    if (count > 0 && (!topHighlight || count > topHighlight.count)) {
      topHighlight = { highlight, count };
    }
  }

  const ratingAvg = Math.round((ratingSum / reviews.length) * 10) / 10;

  return {
    ratedMoviesCount: distinctMovies.size,
    ratingAvg,
    topHighlight,
    topMovie: {
      movieId: bestMovieReview.movieId,
      rating: bestMovieReview.rating,
    },
  };
}
