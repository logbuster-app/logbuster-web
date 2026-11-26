"use client";

import Link from "next/link";
import { useMovieDetail } from "../hooks/useMovieDetail";

export type MovieTitleLinkProps = {
  movieId: string;
  className?: string;
};

/**
 * Link para a ficha do filme exibindo o título consultado via `useMovieDetail`.
 * Enquanto carrega, mostra um espaço reservado neutro (nunca o código do filme).
 * Só em falha ou filme não encontrado cai para o próprio `movieId` (RN-05).
 */
export function MovieTitleLink({ movieId, className }: MovieTitleLinkProps) {
  const trimmedId = movieId.trim();
  const { movie, status } = useMovieDetail(trimmedId);
  const title = movie?.title?.trim();
  const linkClassName =
    className ?? "font-display text-2xl text-primary-text underline-offset-4 hover:underline";

  if (status === "loading" && !title) {
    return (
      <span aria-busy="true" className="inline-flex items-center">
        <span className="sr-only">Carregando título do filme</span>
        <span
          aria-hidden="true"
          className="inline-block h-[0.9em] w-40 max-w-full animate-pulse bg-surface-raised"
        />
      </span>
    );
  }

  return (
    <Link href={`/movies/${encodeURIComponent(trimmedId)}`} className={linkClassName}>
      {title || trimmedId}
    </Link>
  );
}
