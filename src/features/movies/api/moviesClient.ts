import { backendApi } from "@/shared/api/clients";
import { ApiError } from "@/shared/lib/errors";
import type { MovieDetail, MovieSearchPage } from "../types";

type BackendMovieSummary = {
  id: string;
  title: string;
  year: string;
  poster_url: string | null;
};

type BackendMoviePage = {
  items: BackendMovieSummary[];
  total: number;
  page: number;
  page_size: number;
};

type BackendMovieDetail = Omit<MovieDetail, "posterUrl" | "ratingAvg" | "ratingCount"> & {
  poster_url: string | null;
  rating_avg: number | null;
  rating_count: number;
};

export async function searchMovies(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<MovieSearchPage> {
  const data = await backendApi.request<BackendMoviePage>("/api/v1/movies", {
    query: { q: query.trim(), page },
    signal,
    networkMessage: "Não foi possível conectar ao servidor de busca.",
  });
  return {
    movies: data.items.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      posterUrl: movie.poster_url,
    })),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
  };
}

/** Retorna `null` quando o filme não existe (404). */
export async function getMovieById(
  id: string,
  signal?: AbortSignal,
): Promise<MovieDetail | null> {
  const trimmedId = id.trim();
  if (!trimmedId) return null;
  try {
    const data = await backendApi.request<BackendMovieDetail>(
      `/api/v1/movies/${encodeURIComponent(trimmedId)}`,
      { signal, networkMessage: "Não foi possível conectar ao servidor para carregar o filme." },
    );
    return {
      id: data.id,
      title: data.title,
      year: data.year,
      runtime: data.runtime,
      genres: data.genres,
      director: data.director,
      actors: data.actors,
      plot: data.plot,
      posterUrl: data.poster_url,
      ratingAvg: data.rating_avg,
      ratingCount: data.rating_count,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
