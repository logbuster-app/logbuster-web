import type { MovieSummary } from "../../types";
import { MovieCard } from "./MovieCard";

export type MovieGridProps<T extends MovieSummary> = {
  movies: T[];
  /** Legenda opcional por filme, exibida no card (ex.: destaques da comunidade). */
  getCaption?: (movie: T) => string | undefined;
};

export function MovieGrid<T extends MovieSummary>({ movies, getCaption }: MovieGridProps<T>) {
  return (
    <div
      data-testid="movie-grid"
      className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} caption={getCaption?.(movie)} />
      ))}
    </div>
  );
}
