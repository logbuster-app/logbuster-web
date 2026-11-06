/** Modelo de domínio usado pelo front. Independe do formato da API externa. */
export type MovieSummary = {
  /** Identificador IMDb (ex.: tt0133093). Também é o id usado pelo backend do LogBuster. */
  id: string;
  title: string;
  year: string;
  /** URL do poster, ou null quando a API não tem imagem. */
  posterUrl: string | null;
};

export type MovieSearchPage = {
  movies: MovieSummary[];
  total: number;
  page: number;
  pageSize: number;
};
