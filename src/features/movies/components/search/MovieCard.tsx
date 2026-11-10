import Link from "next/link";
import type { MovieSummary } from "../../types";
import { PosterImage } from "../PosterImage";

export function MovieCard({ movie }: { movie: MovieSummary }) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group block rounded-card focus-visible:outline-offset-4"
      aria-label={`Ver detalhes de ${movie.title}`}
    >
      <article>
        <div className="relative aspect-[2/3] overflow-hidden border-2 border-border bg-surface-raised transition-colors group-hover:border-primary-text">
          <PosterImage
            src={movie.posterUrl}
            alt={`Poster de ${movie.title}`}
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw"
          />
        </div>
        <div className="pt-3">
          <h2 className="line-clamp-2 text-sm font-bold uppercase leading-tight tracking-wide transition-colors group-hover:text-primary-text">
            {movie.title}
          </h2>
          <p className="mt-1 text-xs text-muted">{movie.year}</p>
        </div>
      </article>
    </Link>
  );
}
