"use client";

import { useCallback, useEffect, useState } from "react";
import { useMovieRatingContext } from "@/shared/contexts/MovieRatingContext";
import { fetchMovieRating } from "../api/reviews";

/**
 * Busca a nota média do filme e a publica no `MovieRatingContext`, que a ficha do
 * filme exibe. Chame `refresh()` após cadastrar uma avaliação.
 * Falhas são silenciosas: a ficha mantém o último valor conhecido.
 */
export function useMovieRating(movieId: string) {
  const [version, setVersion] = useState(0);
  const updateRating = useMovieRatingContext()?.updateRating;
  const trimmedId = movieId ? movieId.trim() : "";

  useEffect(() => {
    if (!trimmedId) return;
    const controller = new AbortController();

    fetchMovieRating(trimmedId, controller.signal)
      .then(({ averageRating, reviewsCount }) => {
        updateRating?.({ movieId: trimmedId, averageRating, reviewsCount });
      })
      .catch(() => {
        // Nota média é complementar; a ficha segue com o valor anterior.
      });

    return () => controller.abort();
  }, [trimmedId, version, updateRating]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return { refresh };
}
