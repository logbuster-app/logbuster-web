import Image from "next/image";
import type { MovieSummary } from "../types";

export function MovieCard({ movie }: { movie: MovieSummary }) {
  return (
    <article className="group overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-primary-text">
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
        <h3 className="line-clamp-2 text-sm font-semibold">{movie.title}</h3>
        <p className="mt-1 text-xs text-muted">{movie.year}</p>
      </div>
    </article>
  );
}
