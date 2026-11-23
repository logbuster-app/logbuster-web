"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/shared/lib/errors";
import { HIGHLIGHTS, type Highlight } from "@/shared/lib/highlights";
import { HIGHLIGHTS_LIMIT, fetchHighlightedMovies } from "../api/highlightsClient";
import type { HighlightedMovie } from "../types";

type Entry = { movies: HighlightedMovie[] } | { error: string };
type Entries = Partial<Record<Highlight, Entry>>;

export type HighlightedMoviesStatus = "loading" | "success" | "error";

export type HighlightedMoviesState = {
  status: HighlightedMoviesStatus;
  /** Aspecto efetivo. `null` só enquanto o padrão ainda está sendo descoberto. */
  selected: Highlight | null;
  movies: HighlightedMovie[];
  error: string | null;
};

function toMessage(err: unknown) {
  return err instanceof ApiError ? err.message : "Algo deu errado ao carregar os destaques.";
}

/**
 * Filmes mais destacados pela comunidade, por aspecto.
 *
 * - Com `requested` (vindo de `?destaque=`), busca só esse aspecto.
 * - Sem `requested`, busca os seis em paralelo e escolhe o primeiro, na ordem oficial,
 *   que tiver filmes. Se nenhum tiver, fica com o primeiro aspecto e a lista vazia.
 *
 * Os resultados ficam guardados enquanto a tela está montada, então trocar de aspecto
 * depois da primeira carga é instantâneo e não repete a requisição.
 */
export function useHighlightedMovies(requested: Highlight | null): HighlightedMoviesState {
  const [entries, setEntries] = useState<Entries>({});

  // Espelho de `entries` para o efeito saber o que já foi carregado sem depender dele.
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    const wanted: readonly Highlight[] = requested ? [requested] : HIGHLIGHTS;
    // Aspecto com erro conta como não carregado: trocar de chip tenta de novo.
    const missing = wanted.filter((highlight) => !("movies" in (entriesRef.current[highlight] ?? {})));
    if (missing.length === 0) return;

    const controller = new AbortController();
    for (const highlight of missing) {
      fetchHighlightedMovies(highlight, HIGHLIGHTS_LIMIT, controller.signal)
        .then((movies) => setEntries((prev) => ({ ...prev, [highlight]: { movies } })))
        .catch((err) => {
          if (controller.signal.aborted) return;
          setEntries((prev) => ({ ...prev, [highlight]: { error: toMessage(err) } }));
        });
    }

    return () => controller.abort();
  }, [requested]);

  if (requested) {
    const entry = entries[requested];
    if (!entry) return { status: "loading", selected: requested, movies: [], error: null };
    if ("error" in entry) {
      return { status: "error", selected: requested, movies: [], error: entry.error };
    }
    return { status: "success", selected: requested, movies: entry.movies, error: null };
  }

  // Sem aspecto pedido: o primeiro com filmes, esperando os anteriores responderem.
  let firstError: string | null = null;
  for (const highlight of HIGHLIGHTS) {
    const entry = entries[highlight];
    if (!entry) return { status: "loading", selected: null, movies: [], error: null };
    if ("error" in entry) {
      firstError ??= entry.error;
      continue;
    }
    if (entry.movies.length > 0) {
      return { status: "success", selected: highlight, movies: entry.movies, error: null };
    }
  }

  // Ninguém tem filmes. Se algum aspecto falhou, não dá para afirmar que está vazio.
  if (firstError) {
    return { status: "error", selected: HIGHLIGHTS[0], movies: [], error: firstError };
  }
  return { status: "success", selected: HIGHLIGHTS[0], movies: [], error: null };
}
