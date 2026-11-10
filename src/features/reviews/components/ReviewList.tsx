"use client";

import React, { useEffect, useState } from "react";
import { Spinner } from "@/shared/components/Spinner";
import { StateMessage } from "@/shared/components/StateMessage";
import { useMovieRatingContext } from "@/shared/contexts/MovieRatingContext";
import { fetchMovieRating } from "../api/reviews";
import { useMovieReviews } from "../hooks/useMovieReviews";
import type { Review } from "../types";
import { ReviewCard } from "./ReviewCard";
import { ReviewModal } from "./ReviewModal";
import { ReviewSortSelector } from "./ReviewSortSelector";

export type ReviewListProps = {
  movieId: string;
};

export function ReviewList({ movieId }: ReviewListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratingRefresh, setRatingRefresh] = useState(0);
  const [movieRating, setMovieRating] = useState<{
    averageRating: number | null;
    reviewsCount: number;
  } | null>(null);
  const ratingContext = useMovieRatingContext();
  const updateRating = ratingContext?.updateRating;
  const {
    reviews,
    sort,
    status,
    errorMessage,
    votingError,
    interactingReviewId,
    changeSort,
    toggleVote,
    addReview,
  } = useMovieReviews(movieId);

  useEffect(() => {
    const controller = new AbortController();
    fetchMovieRating(movieId, controller.signal)
      .then(({ averageRating, reviewsCount }) => {
        const summary = { movieId, averageRating, reviewsCount };
        setMovieRating(summary);
        updateRating?.(summary);
      })
      .catch(() => {
        if (!controller.signal.aborted) setMovieRating(null);
      });

    return () => controller.abort();
  }, [movieId, ratingRefresh, updateRating]);

  function handleReviewCreated(review: Review) {
    addReview(review);
    setIsModalOpen(false);
    setRatingRefresh((version) => version + 1);
  }

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

        <div className="flex flex-wrap items-center gap-3">
          <ReviewSortSelector
            value={sort}
            onChange={changeSort}
            disabled={status === "loading"}
          />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-card bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
          >
            Avaliar filme
          </button>
        </div>
      </div>

      {movieRating?.reviewsCount ? (
        <p className="text-sm text-muted" aria-live="polite">
          Nota média da comunidade:{" "}
          <span className="font-semibold text-secondary">
            {movieRating.averageRating?.toFixed(1) ?? "--"} / 5
          </span>
          <span>
            {" "}({movieRating.reviewsCount}{" "}
            {movieRating.reviewsCount === 1 ? "avaliação" : "avaliações"})
          </span>
        </p>
      ) : null}

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

      {isModalOpen ? (
        <ReviewModal
          movieId={movieId}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleReviewCreated}
        />
      ) : null}
    </div>
  );
}
