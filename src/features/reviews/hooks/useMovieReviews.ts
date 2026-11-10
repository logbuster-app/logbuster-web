"use client";

import { useCallback, useEffect, useState } from "react";
import { getVisitorId } from "@/shared/lib/visitor";
import { fetchMovieReviews, toggleReviewInteraction } from "../api/reviews";
import type { Review, ReviewInteraction, ReviewSort } from "../types";

export type ReviewsStatus = "loading" | "empty" | "error" | "success";

type ReviewsQueryResult = {
  movieId: string;
  sort: ReviewSort;
  version: number;
  items: Review[];
  total: number;
  error: string | null;
};

export function useMovieReviews(
  movieId: string,
  initialSort: ReviewSort = "well_argued",
) {
  const [sort, setSort] = useState<ReviewSort>(initialSort);
  const [version, setVersion] = useState(0);
  const [queryResult, setQueryResult] = useState<ReviewsQueryResult | null>(null);
  const [votingError, setVotingError] = useState<string | null>(null);
  const [interactingReviewId, setInteractingReviewId] = useState<string | null>(null);

  const trimmedId = movieId ? movieId.trim() : "";

  useEffect(() => {
    if (!trimmedId) return;

    const controller = new AbortController();
    const visitorId = getVisitorId();

    fetchMovieReviews(trimmedId, { sort, visitorId }, controller.signal)
      .then((page) => {
        setQueryResult({
          movieId: trimmedId,
          sort,
          version,
          items: page.items,
          total: page.total,
          error: null,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setQueryResult({
          movieId: trimmedId,
          sort,
          version,
          items: [],
          total: 0,
          error:
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as avaliações.",
        });
      });

    return () => {
      controller.abort();
    };
  }, [trimmedId, sort, version]);

  const current =
    queryResult &&
    queryResult.movieId === trimmedId &&
    queryResult.sort === sort &&
    queryResult.version === version
      ? queryResult
      : null;

  let status: ReviewsStatus = "loading";
  if (!trimmedId) {
    status = "empty";
  } else if (!current) {
    status = "loading";
  } else if (current.error) {
    status = "error";
  } else if (current.items.length === 0) {
    status = "empty";
  } else {
    status = "success";
  }

  const changeSort = useCallback((newSort: ReviewSort) => {
    setSort(newSort);
  }, []);

  const reload = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const addReview = useCallback(
    (review: Review) => {
      setQueryResult((previous) => {
        const sameMovie = previous?.movieId === trimmedId;
        const previousItems = sameMovie ? previous.items : [];
        const alreadyPresent = previousItems.some((item) => item.id === review.id);

        return {
          movieId: trimmedId,
          sort,
          version,
          items: [review, ...previousItems.filter((item) => item.id !== review.id)],
          total: (sameMovie ? previous.total : 0) + (alreadyPresent ? 0 : 1),
          error: null,
        };
      });
    },
    [trimmedId, sort, version],
  );

  const toggleVote = useCallback(
    async (reviewId: string, type: ReviewInteraction) => {
      setVotingError(null);
      setInteractingReviewId(reviewId);
      const visitorId = getVisitorId();

      try {
        const result = await toggleReviewInteraction(reviewId, type, visitorId);
        setQueryResult((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((item) =>
              item.id === reviewId
                ? {
                    ...item,
                    counts: result.counts,
                    viewerInteractions: result.viewerInteractions,
                  }
                : item,
            ),
          };
        });
      } catch (err) {
        setVotingError(
          err instanceof Error
            ? err.message
            : "Falha ao registrar voto. Tente novamente.",
        );
      } finally {
        setInteractingReviewId(null);
      }
    },
    [],
  );

  return {
    reviews: current?.items ?? [],
    total: current?.total ?? 0,
    sort,
    status,
    errorMessage: current?.error ?? null,
    votingError,
    interactingReviewId,
    changeSort,
    toggleVote,
    reload,
    addReview,
  };
}
