"use client";

import { useEffect, useState } from "react";
import { fetchReviewSummary } from "../api/reviewAi";
import type { ReviewSummary } from "../types";

export type ReviewSummaryState =
  | { status: "loading" }
  | { status: "hidden" }
  | { status: "unavailable" }
  | { status: "ready"; text: string; generatedAt: string };

/**
 * Carrega o resumo da comunidade, separado da ficha do filme.
 * `hidden` = menos de 3 avaliações (o bloco não deve aparecer).
 */
export function useReviewSummary(movieId: string): ReviewSummaryState {
  const trimmedId = movieId ? movieId.trim() : "";
  const [result, setResult] = useState<{ movieId: string; summary: ReviewSummary } | null>(null);

  useEffect(() => {
    if (!trimmedId) return;
    const controller = new AbortController();

    fetchReviewSummary(trimmedId, controller.signal)
      .then((summary) => setResult({ movieId: trimmedId, summary }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setResult({ movieId: trimmedId, summary: { status: "unavailable" } });
      });

    return () => controller.abort();
  }, [trimmedId]);

  if (!trimmedId) return { status: "hidden" };
  if (!result || result.movieId !== trimmedId) return { status: "loading" };

  const { summary } = result;
  if (summary.status === "insufficient_reviews") return { status: "hidden" };
  if (summary.status === "unavailable") return { status: "unavailable" };
  return summary;
}
