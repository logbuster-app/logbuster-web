"use client";

import React from "react";
import { Spinner } from "@/shared/components/Spinner";
import { StateMessage } from "@/shared/components/StateMessage";
import { useMovieReviews } from "../hooks/useMovieReviews";
import { ReviewCard } from "./ReviewCard";
import { ReviewSortSelector } from "./ReviewSortSelector";

export type ReviewListProps = {
  movieId: string;
};

export function ReviewList({ movieId }: ReviewListProps) {
  const {
    reviews,
    sort,
    status,
    errorMessage,
    votingError,
    interactingReviewId,
    changeSort,
    toggleVote,
  } = useMovieReviews(movieId);

  return (
    <div className="space-y-6">
      {/* Cabeçalho da seção com seletor de ordenação */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Avaliações da comunidade
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Análises qualificadas por mérito de argumento e votos da comunidade.
          </p>
        </div>

        <ReviewSortSelector
          value={sort}
          onChange={changeSort}
          disabled={status === "loading"}
        />
      </div>

      {/* Banner de erro de voto, se houver falha pontual ao votar */}
      {votingError ? (
        <div
          role="alert"
          className="rounded-card border border-danger/40 bg-danger/10 p-3 text-xs text-danger"
        >
          {votingError}
        </div>
      ) : null}

      {/* Estado: Carregando */}
      {status === "loading" ? (
        <div className="flex justify-center py-12">
          <Spinner label="Carregando avaliações" />
        </div>
      ) : null}

      {/* Estado: Vazio */}
      {status === "empty" ? (
        <div className="py-4">
          <StateMessage
            title="Nenhuma avaliação ainda"
            description="Seja o primeiro a avaliar este filme!"
          />
        </div>
      ) : null}

      {/* Estado: Erro */}
      {status === "error" ? (
        <div className="py-4">
          <StateMessage
            tone="danger"
            title="Erro ao carregar avaliações"
            description={errorMessage ?? "Não foi possível carregar as avaliações."}
          />
        </div>
      ) : null}

      {/* Estado: Sucesso com itens */}
      {status === "success" && reviews.length > 0 ? (
        <div className="space-y-4" aria-label="Lista de avaliações">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onToggleInteraction={toggleVote}
              isInteracting={interactingReviewId === review.id}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
