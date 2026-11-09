// API pública da feature de avaliações.
export { ReviewList } from "./components/ReviewList";
export { ReviewCard } from "./components/ReviewCard";
export { StarRating } from "./components/StarRating";
export { ReviewSortSelector } from "./components/ReviewSortSelector";
export { useMovieReviews } from "./hooks/useMovieReviews";
export { fetchMovieReviews, toggleReviewInteraction, toReview } from "./api/reviews";
export {
  fetchReviewsMock,
  toggleInteractionMock,
  resetMockReviews,
} from "./api/reviews.mock";
export type {
  ReviewId,
  ReviewInteraction,
  ReviewHighlight,
  ReviewSort,
  Review,
  ReviewListPage,
} from "./types";
export { REVIEW_HIGHLIGHT_LABELS, REVIEW_SORT_OPTIONS } from "./types";
