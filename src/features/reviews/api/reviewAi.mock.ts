import type { ReviewSummary } from "../types";
import { fetchMovieRatingMock } from "./reviews.mock";

const MIN_REVIEWS_FOR_SUMMARY = 3;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simula a primeira geração (alguns segundos) e as regras de 3 avaliações. */
export async function fetchReviewSummaryMock(movieId: string): Promise<ReviewSummary> {
  await wait(1200);
  const { reviewsCount } = await fetchMovieRatingMock(movieId);

  if (reviewsCount < MIN_REVIEWS_FOR_SUMMARY) {
    return { status: "insufficient_reviews" };
  }

  return {
    status: "ready",
    text:
      "A comunidade destaca a direção precisa e os efeitos visuais, que ainda impressionam, " +
      "e elogia o roteiro pela forma como mistura ação com ideias sobre realidade e livre-arbítrio. " +
      "A trilha sonora industrial e a fotografia esverdeada aparecem como parte da identidade do filme.",
    generatedAt: new Date().toISOString(),
  };
}
