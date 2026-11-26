"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { env } from "@/shared/config/env";
import { fetchReview } from "../api/reviews";
import type { Review } from "../types";

/** Intervalo entre consultas enquanto a IA analisa a avaliação. */
export const SPOILER_ANALYSIS_POLL_MS = 1500;
/** Janela total de espera: limite da IA (6 s) + busca da sinopse (2 s), com folga. */
export const SPOILER_ANALYSIS_WINDOW_MS = 12_000;

/**
 * Acompanha a análise de spoiler que o backend faz em segundo plano depois de publicar
 * (CR-02). A publicação não espera a IA: este hook só consulta a avaliação recém-criada
 * por alguns segundos e, se a IA marcar spoiler, entrega a versão atualizada.
 *
 * - Avaliação já marcada pelo autor: a IA não é chamada, então não há o que esperar.
 * - Mocks: não há IA, então não acompanha.
 * - Sem marcação dentro da janela: encerra em silêncio (a IA disse que não, ou falhou).
 */
export function useSpoilerAnalysis(onFlagged: (review: Review) => void) {
  const [analyzing, setAnalyzing] = useState<ReadonlySet<string>>(() => new Set());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const controllers = useRef(new Set<AbortController>());
  const active = useRef(true);
  const onFlaggedRef = useRef(onFlagged);

  useEffect(() => {
    onFlaggedRef.current = onFlagged;
  });

  useEffect(() => {
    const pendingTimers = timers.current;
    const pendingControllers = controllers.current;
    active.current = true;
    return () => {
      active.current = false;
      pendingTimers.forEach(clearTimeout);
      pendingTimers.clear();
      pendingControllers.forEach((controller) => controller.abort());
      pendingControllers.clear();
    };
  }, []);

  const stop = useCallback((reviewId: string) => {
    const timer = timers.current.get(reviewId);
    if (timer) clearTimeout(timer);
    timers.current.delete(reviewId);
    if (!active.current) return;
    setAnalyzing((previous) => {
      if (!previous.has(reviewId)) return previous;
      const next = new Set(previous);
      next.delete(reviewId);
      return next;
    });
  }, []);

  const track = useCallback(
    (review: Review) => {
      if (env.useApiMocks || review.isSpoiler) return;

      const reviewId = review.id;
      const deadline = Date.now() + SPOILER_ANALYSIS_WINDOW_MS;
      setAnalyzing((previous) => new Set(previous).add(reviewId));

      const schedule = () => {
        if (!active.current) return;
        if (Date.now() >= deadline) {
          stop(reviewId);
          return;
        }
        timers.current.set(reviewId, setTimeout(poll, SPOILER_ANALYSIS_POLL_MS));
      };

      const poll = () => {
        const controller = new AbortController();
        controllers.current.add(controller);
        fetchReview(reviewId, controller.signal)
          .then((updated) => {
            if (!active.current) return;
            if (updated.isSpoiler) {
              onFlaggedRef.current(updated);
              stop(reviewId);
              return;
            }
            schedule();
          })
          .catch(() => {
            if (!controller.signal.aborted) schedule();
          })
          .finally(() => {
            controllers.current.delete(controller);
          });
      };

      schedule();
    },
    [stop],
  );

  const isAnalyzing = useCallback((reviewId: string) => analyzing.has(reviewId), [analyzing]);

  return { track, isAnalyzing };
}
