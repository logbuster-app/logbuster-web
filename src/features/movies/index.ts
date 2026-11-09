// API pública da feature. Outras partes do app importam apenas daqui.
export {
  MovieSearch,
  MovieCard,
  MovieGrid,
  SearchBar,
} from "./components/search";
export { MovieDetail } from "./components/detail";
export { useMovieDetail } from "./hooks/useMovieDetail";
export type {
  MovieSummary,
  MovieSearchPage,
  MovieDetail as MovieDetailType,
  MovieDetail as MovieDetailData,
} from "./types";
export type { MovieDetailProps } from "./components/detail";
