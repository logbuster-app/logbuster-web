// API pública da feature de avaliações.
export { ReviewList } from "./components/ReviewList";
export { ReviewCard } from "./components/ReviewCard";
export { StarRating } from "./components/StarRating";
export { ReviewSortSelector } from "./components/ReviewSortSelector";
export { ReviewModal } from "./components/ReviewModal";
export { ReviewSummary } from "./components/ReviewSummary";
export { StarRatingInput } from "./components/StarRatingInput";
export { HighlightPicker } from "./components/HighlightPicker";
export { useMovieReviews } from "./hooks/useMovieReviews";
export { useCreateReview } from "./hooks/useCreateReview";
export { useMovieRating } from "./hooks/useMovieRating";
export { useReviewSummary } from "./hooks/useReviewSummary";
export { useSpoilerCheck } from "./hooks/useSpoilerCheck";
export { validateReview, REVIEW_LIMITS } from "./validation";
export type { ReviewFormValues, ReviewValidationResult } from "./validation";
export {
  createReview,
  fetchMovieRating,
  fetchMovieReviews,
  toggleReviewInteraction,
  toReview,
} from "./api/reviews";
export type { MovieRating } from "./api/reviews";
export { checkSpoiler, fetchReviewSummary } from "./api/reviewAi";
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
  CreateReviewInput,
  ReviewSummary as ReviewSummaryData,
  SpoilerCheckStatus,
} from "./types";
export { REVIEW_HIGHLIGHT_LABELS, REVIEW_SORT_OPTIONS } from "./types";
