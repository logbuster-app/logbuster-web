// API pública da feature de avaliações.
export { ReviewList } from "./components/ReviewList";
export { ReviewCard } from "./components/ReviewCard";
export { UserReviewHistory } from "./components/UserReviewHistory";
export type { UserReviewHistoryProps } from "./components/UserReviewHistory";
export { StarRating } from "./components/StarRating";
export { ReviewSortSelector } from "./components/ReviewSortSelector";
export { ReviewModal } from "./components/ReviewModal";
export { ReviewSummary } from "./components/ReviewSummary";
export { StarRatingInput } from "./components/StarRatingInput";
export { HighlightPicker } from "./components/HighlightPicker";
export { useMovieReviews } from "./hooks/useMovieReviews";
export { useUserReviews } from "./hooks/useUserReviews";
export { useCreateReview } from "./hooks/useCreateReview";
export { useMovieRating } from "./hooks/useMovieRating";
export { useReviewSummary } from "./hooks/useReviewSummary";
export { validateReview, REVIEW_LIMITS } from "./validation";
export type { ReviewFormValues, ReviewValidationResult } from "./validation";
export {
  createReview,
  fetchMovieRating,
  fetchMovieReviews,
  fetchUserReviews,
  toggleReviewInteraction,
  toReview,
} from "./api/reviews";
export type { MovieRating, FetchUserReviewsOptions } from "./api/reviews";
export { fetchReviewSummary } from "./api/reviewAi";
export {
  fetchReviewsMock,
  fetchUserReviewsMock,
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
  UserReviewListPage,
  CreateReviewInput,
  ReviewSummary as ReviewSummaryData,
} from "./types";
export { REVIEW_HIGHLIGHT_LABELS, REVIEW_SORT_OPTIONS, SPOILER_VOTE_THRESHOLD } from "./types";
