"use client";

import Link from "next/link";
import { useMovieDetail } from "../hooks/useMovieDetail";

export type MovieTitleLinkProps = {
  movieId: string;
  className?: string;
};

/**
 * Link para a ficha do filme exibindo o título consultado via `useMovieDetail`.
 * Em carregamento ou falha silenciosa, mostra o próprio `movieId` (RN-05).
 */
export function MovieTitleLink({ movieId, className }: MovieTitleLinkProps) {
  const trimmedId = movieId.trim();
  const { movie } = useMovieDetail(trimmedId);
  const label = movie?.title?.trim() || trimmedId;

  return (
    <Link
      href={`/movies/${encodeURIComponent(trimmedId)}`}
      className={
        className ??
        "font-display text-2xl text-primary-text underline-offset-4 hover:underline"
      }
    >
      {label}
    </Link>
  );
}
