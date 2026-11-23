/** Modelo de domínio usado pelo front. Independe do formato da API externa. */
export type MovieSummary = {
  /** Identificador IMDb (ex.: tt0133093). Também é o id usado pelo backend do LogBuster. */
  id: string;
  title: string;
  year: string;
  /** URL do poster, ou null quando a API não tem imagem. */
  posterUrl: string | null;
};

/** Filme do ranking "Destaques da comunidade" (GET /api/v1/highlights/{highlight}/movies). */
export type HighlightedMovie = MovieSummary & {
  /** Média da comunidade; null se o backend não enviar. */
  ratingAvg: number | null;
  ratingCount: number;
  /** Avaliações que incluem o destaque consultado. */
  highlightCount: number;
};

export type MovieSearchPage = {
  movies: MovieSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type MovieDetail = {
  id: string; // imdbID, ex.: "tt0133093"
  title: string;
  year: string | null;
  runtime: string | null;
  genres: string[];
  director: string | null;
  actors: string | null;
  plot: string | null;
  posterUrl: string | null;
  /** Preenchido quando integrado ao backend (FRONT-06 / BACK-05); null enquanto provisório ou sem notas. */
  ratingAvg: number | null;
  ratingCount: number;
};

