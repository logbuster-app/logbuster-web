import type { MovieSummary } from "../../types";
import { MovieCard } from "./MovieCard";

export function MovieGrid({ movies }: { movies: MovieSummary[] }) {
  return (
    <div
      data-testid="movie-grid"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
