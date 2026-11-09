"use client";

import { useCallback, useEffect, useState } from "react";
import { getMovieById } from "../api/moviesClient";
import type { MovieDetail } from "../types";

export type MovieDetailStatus = "loading" | "success" | "not_found" | "error";

type MovieDetailResult = {
  movieId: string;
  version: number;
  movie: MovieDetail | null;
  notFound: boolean;
  error: string | null;
};

export function useMovieDetail(
  movieId: string,
  initialMovie?: MovieDetail | null,
) {
  const trimmedId = movieId ? movieId.trim() : "";

  const [result, setResult] = useState<MovieDetailResult | null>(() => {
    if (initialMovie && trimmedId) {
      return {
        movieId: trimmedId,
        version: 0,
        movie: initialMovie,
        notFound: false,
        error: null,
      };
    }
    return null;
  });
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (!trimmedId) return;

    // Se temos initialMovie fornecido via SSR e não foi solicitada recarga manual (version 0),
    // aproveitamos os dados pré-carregados pelo servidor Next.js
    if (initialMovie && version === 0 && initialMovie.id === trimmedId) {
      return;
    }

    const controller = new AbortController();

    getMovieById(trimmedId, controller.signal)
      .then((data) => {
        setResult({
          movieId: trimmedId,
          version,
          movie: data,
          notFound: data === null,
          error: null,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResult({
          movieId: trimmedId,
          version,
          movie: null,
          notFound: false,
          error:
            err instanceof Error ? err.message : "Erro desconhecido ao carregar o filme.",
        });
      });

    return () => {
      controller.abort();
    };
  }, [trimmedId, version, initialMovie]);

  const current =
    result && result.movieId === trimmedId && result.version === version
      ? result
      : null;

  let status: MovieDetailStatus = "loading";
  if (!trimmedId) {
    status = "not_found";
  } else if (!current) {
    status = "loading";
  } else if (current.notFound) {
    status = "not_found";
  } else if (current.error) {
    status = "error";
  } else {
    status = "success";
  }

  return {
    movie: current?.movie ?? null,
    status,
    error: current?.error ?? null,
    reload,
  };
}
