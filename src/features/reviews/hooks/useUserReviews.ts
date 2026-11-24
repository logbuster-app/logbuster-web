"use client";

import { useCallback, useEffect, useState } from "react";
import { getVisitorId } from "@/shared/lib/visitor";
import { fetchUserReviews, toggleReviewInteraction } from "../api/reviews";
import type { Review, ReviewInteraction } from "../types";

export type UserReviewsStatus = "loading" | "empty" | "error" | "success";

const DEFAULT_PAGE_SIZE = 10;

type UserReviewsQueryState = {
  userId: string;
  version: number;
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
  error: string | null;
};

export function useUserReviews(userId: string) {
  const trimmedId = userId.trim();
  const [version, setVersion] = useState(0);
  const [queryState, setQueryState] = useState<UserReviewsQueryState | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const [votingError, setVotingError] = useState<string | null>(null);
  const [interactingReviewId, setInteractingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!trimmedId) return;

    const controller = new AbortController();
    const visitorId = getVisitorId();

    fetchUserReviews(
      trimmedId,
      { page: 1, pageSize: DEFAULT_PAGE_SIZE, visitorId },
      controller.signal,
    )
      .then((page) => {
        setMoreError(null);
        setQueryState({
          userId: trimmedId,
          version,
          items: page.items,
          total: page.total,
          page: page.page,
          pageSize: page.pageSize,
          error: null,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setQueryState({
          userId: trimmedId,
          version,
          items: [],
          total: 0,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          error:
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o histórico de avaliações.",
        });
      });

    return () => {
      controller.abort();
    };
  }, [trimmedId, version]);

  const current =
    queryState &&
    queryState.userId === trimmedId &&
    queryState.version === version
      ? queryState
      : null;

  let status: UserReviewsStatus = "loading";
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

  const hasMore = current ? current.items.length < current.total : false;

  const loadMore = useCallback(async () => {
    if (!current || loadingMore || current.items.length >= current.total) return;

    setLoadingMore(true);
    setMoreError(null);
    const nextPage = current.page + 1;
    const visitorId = getVisitorId();

    try {
      const page = await fetchUserReviews(trimmedId, {
        page: nextPage,
        pageSize: current.pageSize,
        visitorId,
      });
      setQueryState((prev) => {
        if (!prev || prev.userId !== trimmedId || prev.version !== version) return prev;
        const existingIds = new Set(prev.items.map((item) => item.id));
        const appended = page.items.filter((item) => !existingIds.has(item.id));
        return {
          ...prev,
          items: [...prev.items, ...appended],
          total: page.total,
          page: page.page,
        };
      });
    } catch (err) {
      setMoreError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar mais avaliações.",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [current, loadingMore, trimmedId, version]);

  const toggleVote = useCallback(
    async (reviewId: string, type: ReviewInteraction) => {
      setVotingError(null);
      setInteractingReviewId(reviewId);
      const visitorId = getVisitorId();

      try {
        const result = await toggleReviewInteraction(reviewId, type, visitorId);
        setQueryState((prev) => {
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

  const reload = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return {
    reviews: current?.items ?? [],
    total: current?.total ?? 0,
    status,
    errorMessage: current?.error ?? null,
    hasMore,
    loadingMore,
    moreError,
    votingError,
    interactingReviewId,
    loadMore,
    toggleVote,
    reload,
  };
}
