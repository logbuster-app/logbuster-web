"use client";

import Link from "next/link";
import React from "react";
import { ArrowLeftIcon } from "@/shared/components/ArrowLeftIcon";
import { Spinner } from "@/shared/components/Spinner";
import { StateMessage } from "@/shared/components/StateMessage";
import { formatRating } from "@/shared/lib/format";
import {
  MovieRatingProvider,
  useMovieRatingContext,
} from "@/shared/contexts/MovieRatingContext";
import { useMovieDetail } from "../../hooks/useMovieDetail";
import type { MovieDetail as MovieDetailType } from "../../types";
import { PosterImage } from "../PosterImage";

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
    <div className="space-y-4">
      <nav aria-label="Navegação secundária">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-primary-text hover:underline underline-offset-4"
        >
          <ArrowLeftIcon />
          Voltar para a busca
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
              className="text-sm font-semibold uppercase tracking-wide text-primary-text hover:underline underline-offset-4"
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
        <article className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
            {/* Coluna 1: Pôster com proporção 2:3 */}
            <div className="relative aspect-[2/3] w-full max-w-[280px] mx-auto md:mx-0 overflow-hidden rounded-card border-2 border-foreground bg-surface-raised">
              <PosterImage
                src={movie.posterUrl}
                alt={`Poster de ${movie.title}`}
                sizes="(min-width: 768px) 280px, 100vw"
                priority
                fallbackClassName="min-h-[360px]"
              />
            </div>

            {/* Coluna 2: Dados do filme */}
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h1 className="font-display text-5xl sm:text-7xl text-foreground">
                    {movie.title}
                  </h1>
                  {movie.year ? (
                    <span className="font-display text-3xl sm:text-4xl text-muted">
                      (<span>{movie.year}</span>)
                    </span>
                  ) : null}
                </div>

                {/* Metadados rápidos: duração e gêneros */}
                {movie.runtime || movie.genres.length > 0 ? (
                  <div
                    className="mt-3 flex flex-wrap items-center gap-x-2 text-sm font-medium uppercase tracking-wide text-muted"
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

              <div className="inline-flex items-stretch bg-foreground text-background">
                {currentRating && currentRating.reviewsCount > 0 && currentRating.averageRating !== null ? (
                  <>
                    <span className="flex items-baseline gap-1.5 px-5 py-2">
                      <span className="font-display text-7xl">
                        {formatRating(currentRating.averageRating)}
                      </span>
                      <span className="font-display text-4xl">/ 5</span>
                    </span>
                    <span className="flex flex-col justify-center gap-0.5 border-l-2 border-background px-4 py-2">
                      <span className="text-xs font-bold uppercase tracking-wide">Nota LogBuster</span>
                      <span className="text-lg font-bold">
                        ({currentRating.reviewsCount}{" "}
                        {currentRating.reviewsCount === 1 ? "avaliação" : "avaliações"})
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="flex flex-col justify-center gap-0.5 px-5 py-3">
                    <span className="text-xs font-bold uppercase tracking-wide">Nota LogBuster</span>
                    <span className="text-lg font-bold">Ainda sem avaliações</span>
                  </span>
                )}
              </div>

              {/* Sinopse */}
              <div className="pt-1">
                <p className="font-reading max-w-[68ch] text-lg text-foreground">
                  {movie.plot ?? "Sinopse não informada."}
                </p>
              </div>

              {/* Ficha técnica e avaliação */}
              <div className="space-y-2 pt-2 text-sm">
                <p className="text-muted">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted">Direção</span>{" "}
                  <span className="text-foreground">{movie.director ?? "Não informada"}</span>
                </p>
                <p className="text-muted">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted">Elenco</span>{" "}
                  <span className="text-foreground">{movie.actors ?? "Não informado"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Slot inferior reservado para a seção de avaliações (RN-04) */}
          {children ? (
            <section className="border-t-2 border-foreground pt-5" aria-label="Avaliações do filme">
              {children}
            </section>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}
