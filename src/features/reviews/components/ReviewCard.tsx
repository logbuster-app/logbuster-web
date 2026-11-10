"use client";

import React, { useState } from "react";
import { CheckIcon, PlusIcon, ThumbUpIcon } from "@/shared/components/Icons";
import { WarningIcon } from "@/shared/components/WarningIcon";
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
  /** Análise líder da ordenação por mérito: o carimbo vira bloco vermelho cheio. */
  isLeading?: boolean;
};

export function ReviewCard({
  review,
  onToggleInteraction,
  isInteracting = false,
  isLeading = false,
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

  const secondaryButton =
    "inline-flex h-11 cursor-pointer items-center gap-2 rounded-card border-2 px-4 text-xs font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <article className="grid gap-x-8 gap-y-4 border-t-2 border-foreground py-5 sm:grid-cols-[9.5rem_1fr]">
      {/* Carimbo de mérito (RN-02): o voto "Bem argumentada" é o elemento mais forte do cartão.
          Líder = bloco vermelho; voto seu = bloco osso; demais = contorno. Forma e peso, não só cor. */}
      <button
        type="button"
        disabled={isInteracting}
        onClick={() => onToggleInteraction?.(review.id, "well_argued")}
        aria-pressed={isWellArguedActive}
        className={`group flex cursor-pointer flex-col overflow-hidden rounded-card border-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-max ${
          isLeading
            ? "border-primary bg-primary text-primary-foreground"
            : isWellArguedActive
              ? "border-foreground bg-foreground text-background"
              : "border-foreground text-foreground hover:border-primary-text"
        } ${isLeading && isWellArguedActive ? "outline-2 outline-offset-2 outline-foreground" : ""}`}
      >
        <span className="flex items-baseline justify-between gap-3 p-3 sm:flex-col sm:items-start sm:justify-start sm:gap-1">
          <span className="font-display text-lg">Bem argumentada</span>
          <span className="flex items-baseline gap-2">
            <span className="font-display text-5xl">{review.counts.wellArgued}</span>
            <span aria-hidden="true" className="text-xs font-bold uppercase tracking-wide">
              {review.counts.wellArgued === 1 ? "voto" : "votos"}
            </span>
          </span>
        </span>
        {/* Faixa de ação: deixa claro que o carimbo é um botão e mostra se o voto já foi dado. */}
        <span
          aria-hidden="true"
          className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
            isLeading
              ? "bg-primary-foreground text-foreground"
              : isWellArguedActive
                ? "bg-background text-foreground"
                : "bg-foreground text-background group-hover:bg-primary group-hover:text-primary-foreground"
          }`}
        >
          {isWellArguedActive ? (
            <>
              <CheckIcon />
              Votado
            </>
          ) : (
            <>
              <PlusIcon />
              Votar
            </>
          )}
        </span>
      </button>

      <div className="min-w-0 space-y-4">
        {/* Cabeçalho da avaliação: autor, data e estrelas */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-bold uppercase tracking-wide text-foreground">
              {review.authorName}
            </span>
            <time dateTime={review.createdAt} className="text-sm text-muted">
              {formattedDate}
            </time>
          </div>

          <StarRating rating={review.rating} />
        </div>

        {/* Destaques da análise */}
        {review.highlights.length > 0 ? (
          <div className="flex flex-wrap gap-2" aria-label="Pontos de destaque">
            {review.highlights.map((highlight) => (
              <span
                key={highlight}
                className="border border-border bg-surface-raised px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-foreground"
              >
                {REVIEW_HIGHLIGHT_LABELS[highlight] ?? highlight}
              </span>
            ))}
          </div>
        ) : null}

        {/* Conteúdo com proteção de spoiler (RN-03) */}
        {isSpoilerProtected && !revealed ? (
          <div className="space-y-2 border-2 border-warning bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-warning">
              <WarningIcon className="size-5" />
              <span>Esta avaliação contém spoiler</span>
            </div>
            <p className="text-sm text-muted">
              O conteúdo foi ocultado para proteger sua experiência cinematográfica.
            </p>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mt-1 inline-flex min-h-11 cursor-pointer items-center text-sm font-bold uppercase tracking-wide text-primary-text underline underline-offset-4 hover:text-foreground"
            >
              Mostrar análise
            </button>
          </div>
        ) : (
          <p className="font-reading max-w-[68ch] whitespace-pre-line text-lg text-foreground">
            {review.content}
          </p>
        )}

        {/* Demais interações (RN-02) */}
        <div className="flex flex-wrap items-center gap-2" aria-label="Ações da avaliação">
          <button
            type="button"
            disabled={isInteracting}
            onClick={() => onToggleInteraction?.(review.id, "like")}
            aria-pressed={isLikeActive}
            className={`${secondaryButton} ${
              isLikeActive
                ? "border-foreground bg-foreground text-background"
                : "border-foreground text-foreground hover:bg-foreground hover:text-background"
            }`}
          >
            <ThumbUpIcon />
            <span>Curtir</span>
            <span className="ml-1 border-l-2 border-current pl-3">{review.counts.like}</span>
          </button>

          {!review.isSpoiler ? (
            <button
              type="button"
              disabled={isInteracting}
              onClick={() => onToggleInteraction?.(review.id, "spoiler")}
              aria-pressed={isSpoilerActive}
              className={`${secondaryButton} ${
                isSpoilerActive
                  ? "border-warning bg-warning text-secondary-foreground"
                  : "border-foreground text-foreground hover:border-warning hover:bg-warning hover:text-secondary-foreground"
              }`}
            >
              <WarningIcon />
              <span>Spoiler</span>
              <span className="ml-1 border-l-2 border-current pl-3">{review.counts.spoiler}</span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
