// API pública da feature. Outras partes do app importam apenas daqui.
export { MovieSearch } from "./components/MovieSearch";
export { MovieCard } from "./components/MovieCard";
export { MovieGrid } from "./components/MovieGrid";
export { searchMovies, omdbRequest } from "./api/omdb";
export type { MovieSummary, MovieSearchPage } from "./types";
