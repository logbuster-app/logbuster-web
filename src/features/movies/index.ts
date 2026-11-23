// API pública da feature. Outras partes do app importam apenas daqui.
export {
  MovieSearch,
  MovieCard,
  MovieGrid,
  SearchBar,
} from "./components/search";
export { HighlightsSection } from "./components/highlights";
export { MovieDetail } from "./components/detail";
export { useMovieDetail } from "./hooks/useMovieDetail";
export { useHighlightedMovies } from "./hooks/useHighlightedMovies";
export type {
  MovieSummary,
  MovieSearchPage,
  HighlightedMovie,
  MovieDetail as MovieDetailType,
  MovieDetail as MovieDetailData,
} from "./types";
export type { MovieDetailProps } from "./components/detail";
