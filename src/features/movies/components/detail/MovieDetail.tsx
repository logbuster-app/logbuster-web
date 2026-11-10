"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Spinner } from "@/shared/components/Spinner";
import { StateMessage } from "@/shared/components/StateMessage";
import { formatRating } from "@/shared/lib/format";
import {
  MovieRatingProvider,
  useMovieRatingContext,
} from "@/shared/contexts/MovieRatingContext";
import { useMovieDetail } from "../../hooks/useMovieDetail";
import type { MovieDetail as MovieDetailType } from "../../types";

export type MovieDetailProps = {
  movieId: string;
  initialMovie?: MovieDetailType | null;
  children?: React.ReactNode;
};

export function MovieDetail({ movieId, initialMovie, children }: MovieDetailProps) {
  return (
    <MovieRatingProvider>
      <MovieDetailContent
        movieId={movieId}
        initialMovie={initialMovie}
      >
        {children}
      </MovieDetailContent>
    </MovieRatingProvider>
  );
}

function MovieDetailContent({ movieId, initialMovie, children }: MovieDetailProps) {
  const { movie, status, error } = useMovieDetail(movieId, initialMovie);
  const ratingContext = useMovieRatingContext();
  const currentRating =
    movie && ratingContext?.rating?.movieId === movie.id
      ? ratingContext.rating
      : movie
        ? {
            movieId: movie.id,
            averageRating: movie.ratingAvg,
            reviewsCount: movie.ratingCount,
          }
        : null;

  return (
    <div className="space-y-6">
      <nav aria-label="Navegação secundária">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-primary-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text rounded"
        >
          ← Voltar para a busca
        </Link>
      </nav>

      {status === "loading" ? (
        <div className="flex justify-center py-16">
          <Spinner label="Carregando detalhes do filme" />
        </div>
      ) : null}

      {status === "not_found" ? (
        <div className="py-8 space-y-4">
          <StateMessage
            title="Filme não encontrado"
            description="Não encontramos o filme solicitado no catálogo."
          />
          <div className="text-center">
            <Link
              href="/"
              className="text-sm font-medium text-primary-text hover:underline"
            >
              Fazer uma nova busca
            </Link>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="py-8">
          <StateMessage
            tone="danger"
            title="Erro ao carregar filme"
            description={error ?? "Não foi possível carregar os dados do filme."}
          />
        </div>
      ) : null}

      {status === "success" && movie ? (
        <article className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            {/* Coluna 1: Pôster com proporção 2:3 */}
            <div className="relative aspect-[2/3] w-full max-w-[240px] mx-auto md:mx-0 overflow-hidden rounded-card border border-border bg-surface-raised">
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={`Poster de ${movie.title}`}
                  fill
                  sizes="(min-width: 768px) 240px, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full min-h-[360px] items-center justify-center p-4 text-center text-sm text-subtle">
                  Sem poster
                </div>
              )}
            </div>

            {/* Coluna 2: Dados do filme */}
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {movie.title}
                  </h1>
                  {movie.year ? (
                    <span className="text-2xl sm:text-3xl font-normal text-muted">
                      (<span>{movie.year}</span>)
                    </span>
                  ) : null}
                </div>

                {/* Metadados rápidos: duração e gêneros */}
                {movie.runtime || movie.genres.length > 0 ? (
                  <div
                    className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-muted"
                    aria-label="Metadados do filme"
                  >
                    {movie.runtime ? <span>{movie.runtime}</span> : null}
                    {movie.runtime && movie.genres.length > 0 ? (
                      <span aria-hidden="true">·</span>
                    ) : null}
                    {movie.genres.map((genre, index) => (
                      <React.Fragment key={genre}>
                        {index > 0 ? <span aria-hidden="true">·</span> : null}
                        <span>{genre}</span>
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Sinopse */}
              <div className="pt-1">
                <p className="text-sm sm:text-base leading-relaxed text-foreground">
                  {movie.plot ?? "Sinopse não informada."}
                </p>
              </div>

              {/* Ficha técnica e avaliação */}
              <div className="space-y-2 pt-2 text-sm">
                <p className="text-muted">
                  <span className="text-muted">Direção</span>{" "}
                  <span className="text-foreground">{movie.director ?? "Não informada"}</span>
                </p>
                <p className="text-muted">
                  <span className="text-muted">Elenco</span>{" "}
                  <span className="text-foreground">{movie.actors ?? "Não informado"}</span>
                </p>
                <p className="text-muted">
                  <span className="text-muted">Nota LogBuster</span>{" "}
                  {currentRating && currentRating.reviewsCount > 0 && currentRating.averageRating !== null ? (
                    <span className="text-secondary font-medium">
                      <span>{formatRating(currentRating.averageRating)}</span>
                      <span>
                        {" "}
                        / 5 ({currentRating.reviewsCount}{" "}
                        {currentRating.reviewsCount === 1 ? "avaliação" : "avaliações"})
                      </span>
                    </span>
                  ) : (
                    <span className="text-secondary font-medium">
                      Ainda sem avaliações
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Slot inferior reservado para a seção de avaliações (RN-04) */}
          {children ? (
            <section className="border-t border-border pt-8" aria-label="Avaliações do filme">
              {children}
            </section>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}
