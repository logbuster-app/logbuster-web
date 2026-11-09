import { env } from "@/shared/config/env";
import { backendApi } from "@/shared/api/clients";
import { ApiError } from "@/shared/lib/errors";
import type {
  Review,
  ReviewHighlight,
  ReviewInteraction,
  ReviewListPage,
  ReviewSort,
} from "../types";
import {
  type InteractionToggleResult,
  fetchReviewsMock,
  toggleInteractionMock,
} from "./reviews.mock";

export type BackendReviewItem = {
  id: string;
  movie_id: string;
  author_name: string;
  rating: number;
  content: string;
  is_spoiler: boolean;
  highlights: ReviewHighlight[];
  counts: {
    like: number;
    spoiler: number;
    well_argued: number;
  };
  viewer_interactions: ReviewInteraction[];
  created_at: string;
};

export type BackendReviewListResponse = {
  items: BackendReviewItem[];
  total: number;
  page: number;
  page_size: number;
  sort: ReviewSort;
};

export type BackendInteractionResponse = {
  review_id: string;
  type: ReviewInteraction;
  active: boolean;
  counts: {
    like: number;
    spoiler: number;
    well_argued: number;
  };
  viewer_interactions: ReviewInteraction[];
};

export function toReview(item: BackendReviewItem): Review {
  return {
    id: String(item.id),
    movieId: item.movie_id,
    authorName: item.author_name,
    rating: item.rating,
    content: item.content,
    isSpoiler: Boolean(item.is_spoiler),
    highlights: item.highlights ?? [],
    counts: {
      like: item.counts?.like ?? 0,
      spoiler: item.counts?.spoiler ?? 0,
      wellArgued: item.counts?.well_argued ?? 0,
    },
    viewerInteractions: item.viewer_interactions ?? [],
    createdAt: item.created_at,
  };
}

export type FetchMovieReviewsOptions = {
  sort?: ReviewSort;
  page?: number;
  pageSize?: number;
  visitorId?: string;
};

export async function fetchMovieReviews(
  movieId: string,
  options?: FetchMovieReviewsOptions,
  signal?: AbortSignal,
): Promise<ReviewListPage> {
  if (env.useApiMocks) {
    return fetchReviewsMock(movieId, options);
  }

  const sort = options?.sort ?? "well_argued";
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;

  let data: BackendReviewListResponse;
  try {
    data = await backendApi.request<BackendReviewListResponse>(
      `/api/v1/movies/${encodeURIComponent(movieId)}/reviews`,
      {
        query: { sort, page, page_size: pageSize },
        headers: options?.visitorId ? { "X-Visitor-Id": options.visitorId } : undefined,
        signal,
        networkMessage: "Não foi possível conectar ao servidor de avaliações.",
        errorMessage: "O servidor retornou um erro ao buscar as avaliações.",
      },
    );
  } catch (err) {
    // 404 = filme ainda sem avaliações.
    if (err instanceof ApiError && err.status === 404) {
      return { items: [], total: 0, page, pageSize, sort };
    }
    throw err;
  }

  return {
    items: (data.items ?? []).map(toReview),
    total: Number(data.total ?? 0),
    page: Number(data.page ?? page),
    pageSize: Number(data.page_size ?? pageSize),
    sort: data.sort ?? sort,
  };
}

export async function toggleReviewInteraction(
  reviewId: string,
  type: ReviewInteraction,
  visitorId: string,
  signal?: AbortSignal,
): Promise<InteractionToggleResult> {
  if (env.useApiMocks) {
    return toggleInteractionMock(reviewId, type, visitorId);
  }

  const data = await backendApi.request<BackendInteractionResponse>(
    `/api/v1/reviews/${encodeURIComponent(reviewId)}/interactions`,
    {
      method: "POST",
      body: { type },
      headers: { "X-Visitor-Id": visitorId },
      signal,
      networkMessage: "Não foi possível registrar sua interação no momento.",
      errorMessage: "Não foi possível atualizar a interação na avaliação.",
    },
  );

  return {
    reviewId: String(data.review_id),
    type: data.type,
    active: data.active,
    counts: {
      like: data.counts?.like ?? 0,
      spoiler: data.counts?.spoiler ?? 0,
      wellArgued: data.counts?.well_argued ?? 0,
    },
    viewerInteractions: data.viewer_interactions ?? [],
  };
}
