"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchUserReviews } from "../api/reviews";
import type { Review } from "../types";

export const TIME_MACHINE_PAGE_SIZE = 50;
export const TIME_MACHINE_MAX_PAGES = 4;
export const TIME_MACHINE_MAX_REVIEWS = TIME_MACHINE_PAGE_SIZE * TIME_MACHINE_MAX_PAGES;

export type UserReviewsAllStatus = "loading" | "success" | "error";

type AllReviewsQueryState = {
  userId: string;
  version: number;
  reviews: Review[];
  total: number;
  error: string | null;
};

/**
 * Busca até 4 páginas de 50 itens (máximo 200 avaliações) do histórico público
 * da conta para alimentar a Máquina do Tempo (SPEC-FRONT-10 RN-04).
 */
export function useUserReviewsAll(userId: string) {
  const trimmedId = userId.trim();
  const [version, setVersion] = useState(0);
  const [queryState, setQueryState] = useState<AllReviewsQueryState | null>(null);

  useEffect(() => {
    if (!trimmedId) return;

    const controller = new AbortController();

    async function loadAllPages() {
      const collected: Review[] = [];
      const seenIds = new Set<string>();
      let total = 0;

      for (let page = 1; page <= TIME_MACHINE_MAX_PAGES; page += 1) {
        const result = await fetchUserReviews(
          trimmedId,
          { page, pageSize: TIME_MACHINE_PAGE_SIZE },
          controller.signal,
        );
        total = result.total;

        for (const item of result.items) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            collected.push(item);
          }
        }

        if (
          result.items.length === 0 ||
          collected.length >= total ||
          collected.length >= TIME_MACHINE_MAX_REVIEWS
        ) {
          break;
        }
      }

      if (!controller.signal.aborted) {
        setQueryState({
          userId: trimmedId,
          version,
          reviews: collected.slice(0, TIME_MACHINE_MAX_REVIEWS),
          total,
          error: null,
        });
      }
    }

    loadAllPages().catch((err) => {
      if (controller.signal.aborted) return;
      setQueryState({
        userId: trimmedId,
        version,
        reviews: [],
        total: 0,
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

  let status: UserReviewsAllStatus = "loading";
  if (!trimmedId) {
    status = "error";
  } else if (!current) {
    status = "loading";
  } else if (current.error) {
    status = "error";
  } else {
    status = "success";
  }

  const reload = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return {
    reviews: current?.reviews ?? [],
    total: current?.total ?? 0,
    status,
    error: current?.error ?? null,
    reload,
  };
}
