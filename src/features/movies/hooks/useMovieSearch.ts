"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/lib/errors";
import { searchMovies } from "../api/moviesClient";
import type { MovieSummary } from "../types";

type Result = {
  query: string;
  movies: MovieSummary[];
  total: number;
  page: number;
  error: string | null;
};

export type MovieSearchStatus = "idle" | "loading" | "success" | "error";

function toMessage(err: unknown) {
  return err instanceof ApiError ? err.message : "Algo deu errado ao buscar filmes.";
}

/** Busca filmes por texto e permite carregar páginas adicionais. */
export function useMovieSearch(query: string) {
  const [result, setResult] = useState<Result | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();

    searchMovies(query, 1, controller.signal)
      .then((data) =>
        setResult({ query, movies: data.movies, total: data.total, page: 1, error: null }),
      )
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResult({ query, movies: [], total: 0, page: 1, error: toMessage(err) });
      });

    return () => controller.abort();
  }, [query]);

  // O resultado só vale se for da busca atual; caso contrário estamos carregando.
  const current = result && result.query === query ? result : null;

  let status: MovieSearchStatus = "idle";
  if (query) status = !current ? "loading" : current.error ? "error" : "success";

  const movies = current?.movies ?? [];
  const total = current?.total ?? 0;
  const hasMore = status === "success" && movies.length < total;

  const loadMore = useCallback(async () => {
    if (!current || loadingMore) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const data = await searchMovies(current.query, current.page + 1);
      setResult({
        ...current,
        movies: [...current.movies, ...data.movies],
        page: data.page,
      });
    } catch (err) {
      setMoreError(toMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }, [current, loadingMore]);

  return {
    status,
    movies,
    total,
    error: current?.error ?? null,
    hasMore,
    loadMore,
    loadingMore,
    moreError,
  };
}
