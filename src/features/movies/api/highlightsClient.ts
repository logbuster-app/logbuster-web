import { backendApi } from "@/shared/api/clients";
import { env } from "@/shared/config/env";
import type { Highlight } from "@/shared/lib/highlights";
import type { HighlightedMovie } from "../types";
import { fetchHighlightedMoviesMock } from "./highlights.mock";

/** Máximo de filmes exibidos por aspecto (SPEC-FRONT-11). O backend aceita de 1 a 20. */
export const HIGHLIGHTS_LIMIT = 10;

type BackendHighlightedMovie = {
  id: string;
  title: string;
  /** Null quando a OMDb está fora do ar (o backend devolve `title = id`). */
  year: string | null;
  poster_url: string | null;
  rating_avg: number | null;
  rating_count: number;
  highlight_count: number;
};

type BackendHighlightedMovies = {
  items: BackendHighlightedMovie[];
};

export function toHighlightedMovie(item: BackendHighlightedMovie): HighlightedMovie {
  return {
    id: item.id,
    title: item.title,
    year: item.year ?? "",
    posterUrl: item.poster_url,
    ratingAvg: item.rating_avg,
    ratingCount: item.rating_count,
    highlightCount: item.highlight_count,
  };
}

/**
 * Filmes mais destacados pela comunidade num aspecto, já ordenados pelo backend
 * (contagem, depois nota média). Aspecto sem filmes devolve lista vazia.
 */
export async function fetchHighlightedMovies(
  highlight: Highlight,
  limit: number = HIGHLIGHTS_LIMIT,
  signal?: AbortSignal,
): Promise<HighlightedMovie[]> {
  if (env.useApiMocks) {
    return fetchHighlightedMoviesMock(highlight, limit);
  }

  const data = await backendApi.request<BackendHighlightedMovies>(
    `/api/v1/highlights/${encodeURIComponent(highlight)}/movies`,
    {
      query: { limit },
      signal,
      networkMessage: "Não foi possível conectar ao servidor para carregar os destaques.",
    },
  );
  return data.items.map(toHighlightedMovie);
}
