import { env } from "@/shared/config/env";
import { ApiError } from "@/shared/lib/errors";
import type { MovieDetail, MovieSearchPage, MovieSummary } from "../types";

/**
 * Acesso à OMDb. SOMENTE SERVIDOR: usa a chave privada `OMDB_API_KEY`.
 * O navegador consome `moviesClient.ts`, que passa pelas rotas `/api/movies/*`.
 */

/** A OMDb devolve sempre 10 resultados por página na busca. */
export const OMDB_PAGE_SIZE = 10;

type OmdbSearchItem = {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
};

export type OmdbMovieDetailRaw = {
  Title?: string;
  Year?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Actors?: string;
  Plot?: string;
  Poster?: string;
  imdbID?: string;
  Response?: "True" | "False";
  Error?: string;
};

type OmdbResponse = {
  Response: "True" | "False";
  Error?: string;
  Search?: OmdbSearchItem[];
  totalResults?: string;
  Title?: string;
  Year?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Actors?: string;
  Plot?: string;
  Poster?: string;
  imdbID?: string;
};

/**
 * Chamada genérica à OMDb. Novas consultas (ex.: filme por id, parâmetro `i`)
 * devem reutilizar esta função e adicionar apenas o mapper do resultado.
 */
export async function omdbRequest(
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<OmdbResponse> {
  if (!env.omdbApiKey) {
    throw new ApiError(
      "A chave da OMDb não está configurada. Veja o arquivo .env.example.",
      "config",
    );
  }

  const url = new URL("/", env.omdbBaseUrl);
  url.search = new URLSearchParams({ apikey: env.omdbApiKey, ...params }).toString();

  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("Não foi possível conectar à API de filmes.", "network");
  }

  if (res.status === 401) {
    throw new ApiError("A chave da OMDb é inválida ou expirou.", "config");
  }
  if (!res.ok) {
    throw new ApiError("A API de filmes retornou um erro inesperado.", "upstream");
  }
  return (await res.json()) as OmdbResponse;
}

export function toMovieSummary(item: OmdbSearchItem): MovieSummary {
  return {
    id: item.imdbID,
    title: item.Title,
    year: item.Year,
    posterUrl: item.Poster && item.Poster !== "N/A" ? item.Poster : null,
  };
}

export async function searchMovies(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<MovieSearchPage> {
  const data = await omdbRequest(
    { s: query.trim(), type: "movie", page: String(page) },
    signal,
  );

  if (data.Response === "False") {
    // "Movie not found!" é um resultado vazio válido, não uma falha.
    if (data.Error === "Movie not found!") {
      return { movies: [], total: 0, page, pageSize: OMDB_PAGE_SIZE };
    }
    if (data.Error === "Too many results.") {
      throw new ApiError("Muitos resultados. Digite um termo de busca mais específico.");
    }
    if (data.Error?.toLowerCase().includes("api key")) {
      throw new ApiError("A chave da OMDb é inválida ou expirou.", "config");
    }
    throw new ApiError(data.Error ?? "A API de filmes retornou um erro inesperado.");
  }

  return {
    movies: (data.Search ?? []).map(toMovieSummary),
    total: Number(data.totalResults ?? 0),
    page,
    pageSize: OMDB_PAGE_SIZE,
  };
}

function normalizeOmdbField(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === "N/A") {
    return null;
  }
  return trimmed;
}

export function toMovieDetail(raw: OmdbMovieDetailRaw): MovieDetail {
  const genresRaw = normalizeOmdbField(raw.Genre);
  const genres = genresRaw
    ? genresRaw
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g && g.toUpperCase() !== "N/A")
    : [];

  return {
    id: raw.imdbID ?? "",
    title: raw.Title ?? "",
    year: normalizeOmdbField(raw.Year),
    runtime: normalizeOmdbField(raw.Runtime),
    genres,
    director: normalizeOmdbField(raw.Director),
    actors: normalizeOmdbField(raw.Actors),
    plot: normalizeOmdbField(raw.Plot),
    posterUrl: normalizeOmdbField(raw.Poster),
    ratingAvg: null,
    ratingCount: 0,
  };
}

export async function getMovieById(
  id: string,
  signal?: AbortSignal,
): Promise<MovieDetail | null> {
  const trimmedId = id ? id.trim() : "";
  if (!trimmedId) return null;

  const data = (await omdbRequest(
    { i: trimmedId, plot: "full" },
    signal,
  )) as OmdbMovieDetailRaw;

  if (data.Response === "False") {
    if (data.Error?.toLowerCase().includes("api key")) {
      throw new ApiError("A chave da OMDb é inválida ou expirou.", "config");
    }
    return null;
  }

  return toMovieDetail(data);
}

