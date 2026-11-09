import Image from "next/image";
import Link from "next/link";
import type { MovieSummary } from "../../types";

export function MovieCard({ movie }: { movie: MovieSummary }) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
      aria-label={`Ver detalhes de ${movie.title}`}
    >
      <article className="overflow-hidden rounded-card border border-border bg-surface transition-colors group-hover:border-primary-text">
        <div className="relative aspect-[2/3] bg-surface-raised">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={`Poster de ${movie.title}`}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-3 text-center text-sm text-subtle">
              Sem poster
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary-text transition-colors">
            {movie.title}
          </h3>
          <p className="mt-1 text-xs text-muted">{movie.year}</p>
        </div>
      </article>
    </Link>
  );
}
