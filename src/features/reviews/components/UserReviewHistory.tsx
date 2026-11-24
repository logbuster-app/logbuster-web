"use client";

import React, { useEffect, type ReactNode } from "react";
import { Spinner } from "@/shared/components/Spinner";
import { StateMessage } from "@/shared/components/StateMessage";
import { useUserReviews } from "../hooks/useUserReviews";
import { ReviewCard } from "./ReviewCard";

export type UserReviewHistoryProps = {
  userId: string;
  renderMovie?: (movieId: string) => ReactNode;
  onTotalLoaded?: (total: number) => void;
};

/**
 * Histórico paginado de avaliações vinculadas a uma conta (SPEC-FRONT-09, RN-03/04).
 * Recebe `renderMovie` por inversão de dependência para não importar `features/movies`.
 */
export function UserReviewHistory({
  userId,
  renderMovie,
  onTotalLoaded,
}: UserReviewHistoryProps) {
  const {
    reviews,
    total,
    status,
    errorMessage,
    hasMore,
    loadingMore,
    moreError,
    votingError,
    interactingReviewId,
    loadMore,
    toggleVote,
  } = useUserReviews(userId);

  useEffect(() => {
    if (status === "success" || status === "empty") {
      onTotalLoaded?.(total);
    }
  }, [status, total, onTotalLoaded]);

  return (
    <section className="space-y-4 border-t-2 border-foreground pt-6" aria-label="Histórico de avaliações">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-4xl text-foreground">
          Avaliações publicadas
        </h2>
        {status === "success" ? (
          <span className="text-sm font-bold uppercase tracking-wide text-muted">
            {total} {total === 1 ? "avaliação" : "avaliações"}
          </span>
        ) : null}
      </div>

      {votingError ? (
        <div
          role="alert"
          className="rounded-card border-2 border-danger bg-surface p-3 text-sm text-danger"
        >
          {votingError}
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="flex justify-center py-12">
          <Spinner label="Carregando histórico de avaliações" />
        </div>
      ) : null}

      {status === "empty" ? (
        <div className="py-4">
          <StateMessage
            title="Nenhuma avaliação publicada"
            description="Esta conta ainda não publicou análises de filmes."
          />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="py-4">
          <StateMessage
            tone="danger"
            title="Erro ao carregar histórico"
            description={errorMessage ?? "Não foi possível carregar o histórico de avaliações."}
          />
        </div>
      ) : null}

      {status === "success" && reviews.length > 0 ? (
        <div className="space-y-6">
          <div aria-label="Lista de avaliações do perfil">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                movieSlot={renderMovie ? renderMovie(review.movieId) : undefined}
                onToggleInteraction={toggleVote}
                isInteracting={interactingReviewId === review.id}
              />
            ))}
          </div>

          {moreError ? <StateMessage tone="danger" title={moreError} /> : null}

          {hasMore ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="min-h-11 cursor-pointer rounded-card border-2 border-foreground px-8 py-2.5 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:border-primary-text hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? "Carregando..." : "Carregar mais"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
