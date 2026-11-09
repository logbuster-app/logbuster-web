import { internalApi } from "@/shared/api/clients";
import { ApiError } from "@/shared/lib/errors";
import type { MovieDetail, MovieSearchPage } from "../types";

/** Service do navegador: fala com as rotas internas do Next.js, nunca direto com a OMDb. */

export function searchMovies(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<MovieSearchPage> {
  return internalApi.request<MovieSearchPage>("/api/movies/search", {
    query: { q: query.trim(), page },
    signal,
    networkMessage: "Não foi possível conectar ao servidor de busca.",
  });
}

/** Retorna `null` quando o filme não existe (404). */
export async function getMovieById(
  id: string,
  signal?: AbortSignal,
): Promise<MovieDetail | null> {
  try {
    return await internalApi.request<MovieDetail>(`/api/movies/${encodeURIComponent(id.trim())}`, {
      signal,
      networkMessage: "Não foi possível conectar ao servidor para carregar o filme.",
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
