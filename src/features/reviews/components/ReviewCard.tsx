"use client";

import React, { useState } from "react";
import {
  REVIEW_HIGHLIGHT_LABELS,
  type Review,
  type ReviewInteraction,
} from "../types";
import { StarRating } from "./StarRating";

export type ReviewCardProps = {
  review: Review;
  onToggleInteraction?: (reviewId: string, type: ReviewInteraction) => void;
  isInteracting?: boolean;
};

export function ReviewCard({
  review,
  onToggleInteraction,
  isInteracting = false,
}: ReviewCardProps) {
  const isSpoilerProtected = review.isSpoiler || review.counts.spoiler >= 3;
  const [revealed, setRevealed] = useState(false);

  const formattedDate = new Date(review.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isWellArguedActive = review.viewerInteractions.includes("well_argued");
  const isLikeActive = review.viewerInteractions.includes("like");
  const isSpoilerActive = review.viewerInteractions.includes("spoiler");

  return (
    <article className="rounded-card border border-border bg-surface p-4 space-y-3">
      {/* Cabeçalho da avaliação: autor, data e estrelas */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{review.authorName}</span>
          <span className="text-xs text-muted">•</span>
          <time
            dateTime={review.createdAt}
            className="text-xs text-muted capitalize"
          >
            {formattedDate}
          </time>
        </div>

        <StarRating rating={review.rating} />
      </div>

      {/* Badges de destaques da análise */}
      {review.highlights.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" aria-label="Pontos de destaque">
          {review.highlights.map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-primary-text/40 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {REVIEW_HIGHLIGHT_LABELS[highlight] ?? highlight}
            </span>
          ))}
        </div>
      ) : null}

      {/* Conteúdo com proteção de spoiler (RN-03) */}
      {isSpoilerProtected && !revealed ? (
        <div className="rounded-card border border-warning/40 bg-surface-raised p-4 space-y-2">
          <div className="flex items-center gap-2 text-warning font-semibold text-sm">
            <span aria-hidden="true">⚠️</span>
            <span>Esta avaliação contém spoiler</span>
          </div>
          <p className="text-xs text-muted">
            O conteúdo foi ocultado para proteger sua experiência cinematográfica.
          </p>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-1 inline-flex items-center text-sm font-semibold text-primary-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text rounded"
          >
            Mostrar análise
          </button>
        </div>
      ) : (
        <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-line">
          {review.content}
        </p>
      )}

      {/* Barra de interações qualificadas (RN-02) */}
      <div
        className="flex flex-wrap items-center gap-2 pt-2 border-t border-border"
        aria-label="Ações da avaliação"
      >
        {/* Bem argumentada */}
        <button
          type="button"
          disabled={isInteracting}
          onClick={() => onToggleInteraction?.(review.id, "well_argued")}
          aria-pressed={isWellArguedActive}
          className={`inline-flex h-9 items-center gap-2 rounded-card border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text disabled:opacity-50 ${
            isWellArguedActive
              ? "border-primary-text bg-primary/20 text-primary-text"
              : "border-border bg-surface-raised text-muted hover:border-primary-text/60 hover:text-foreground"
          }`}
        >
          <span aria-hidden="true">💡</span>
          <span>Bem argumentada</span>
          <span className="font-semibold">{review.counts.wellArgued}</span>
        </button>

        {/* Curtir */}
        <button
          type="button"
          disabled={isInteracting}
          onClick={() => onToggleInteraction?.(review.id, "like")}
          aria-pressed={isLikeActive}
          className={`inline-flex h-9 items-center gap-2 rounded-card border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text disabled:opacity-50 ${
            isLikeActive
              ? "border-primary-text bg-primary/20 text-primary-text"
              : "border-border bg-surface-raised text-muted hover:border-primary-text/60 hover:text-foreground"
          }`}
        >
          <span aria-hidden="true">👍</span>
          <span>Curtir</span>
          <span className="font-semibold">{review.counts.like}</span>
        </button>

        {/* Spoiler */}
        <button
          type="button"
          disabled={isInteracting}
          onClick={() => onToggleInteraction?.(review.id, "spoiler")}
          aria-pressed={isSpoilerActive}
          className={`inline-flex h-9 items-center gap-2 rounded-card border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text disabled:opacity-50 ${
            isSpoilerActive
              ? "border-warning bg-warning/15 text-warning"
              : "border-border bg-surface-raised text-muted hover:border-warning/60 hover:text-foreground"
          }`}
        >
          <span aria-hidden="true">⚠️</span>
          <span>Spoiler</span>
          <span className="font-semibold">{review.counts.spoiler}</span>
        </button>
      </div>
    </article>
  );
}
