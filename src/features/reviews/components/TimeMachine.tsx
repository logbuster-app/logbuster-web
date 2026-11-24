"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeftIcon } from "@/shared/components/ArrowLeftIcon";
import { StateMessage } from "@/shared/components/StateMessage";
import { formatRating } from "@/shared/lib/format";
import { computeTimeMachine } from "../timeMachine";
import { REVIEW_HIGHLIGHT_LABELS, type Review } from "../types";

export type TimeMachineArchetype = {
  title: string;
  description: string;
};

export type TimeMachineProps = {
  displayName: string;
  archetype: TimeMachineArchetype | null;
  reviews: readonly Review[];
  profileHref: string;
  renderMovie: (movieId: string, linkClassName?: string) => ReactNode;
};

type PosterTone = "vermelhao" | "osso" | "superficie";

type PosterSlide = {
  key: string;
  tone: PosterTone;
  eyebrow: string;
  content: ReactNode;
};

const TONE_CLASSES: Record<PosterTone, string> = {
  vermelhao: "border-foreground bg-primary text-primary-foreground",
  osso: "border-foreground bg-foreground text-background",
  superficie: "border-foreground bg-surface text-foreground",
};

const MOVIE_LINK_BY_TONE: Record<PosterTone, string> = {
  vermelhao:
    "font-display text-5xl sm:text-7xl text-primary-foreground underline decoration-2 underline-offset-4 hover:opacity-80 focus-visible:outline-primary-foreground",
  osso:
    "font-display text-5xl sm:text-7xl text-background underline decoration-2 underline-offset-4 hover:opacity-80",
  superficie:
    "font-display text-5xl sm:text-7xl text-primary-text underline decoration-2 underline-offset-4 hover:text-foreground",
};

const TONE_ROTATION: readonly PosterTone[] = ["vermelhao", "osso", "superficie"];

/**
 * Sequência de cartazes da Máquina do Tempo (SPEC-FRONT-10 RN-05..RN-07, §4.3).
 * Nunca renderiza o texto das avaliações — não há risco de spoiler (RN-06).
 */
export function TimeMachine({
  displayName,
  archetype,
  reviews,
  profileHref,
  renderMovie,
}: TimeMachineProps) {
  const stats = useMemo(() => computeTimeMachine(reviews), [reviews]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = useMemo<PosterSlide[]>(() => {
    if (!stats) return [];

    const list: PosterSlide[] = [];

    const moviesTone = TONE_ROTATION[list.length % TONE_ROTATION.length];
    list.push({
      key: "movies",
      tone: moviesTone,
      eyebrow: "Filmes avaliados",
      content: (
        <div className="space-y-3">
          <p className="font-display text-7xl sm:text-8xl">
            {stats.ratedMoviesCount}
          </p>
          <p className="text-sm font-bold uppercase tracking-wide">
            {stats.ratedMoviesCount === 1
              ? "filme distinto na sua jornada"
              : "filmes distintos na sua jornada"}
          </p>
        </div>
      ),
    });

    const ratingTone = TONE_ROTATION[list.length % TONE_ROTATION.length];
    list.push({
      key: "rating",
      tone: ratingTone,
      eyebrow: "Nota média",
      content: (
        <div className="space-y-3">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-7xl sm:text-8xl">
              {formatRating(stats.ratingAvg)}
            </span>
            <span className="font-display text-4xl sm:text-5xl">/ 5</span>
          </p>
          <p className="text-sm font-bold uppercase tracking-wide">
            média em {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
          </p>
        </div>
      ),
    });

    if (stats.topHighlight) {
      const highlightTone = TONE_ROTATION[list.length % TONE_ROTATION.length];
      const highlightLabel =
        REVIEW_HIGHLIGHT_LABELS[stats.topHighlight.highlight] ??
        stats.topHighlight.highlight;
      list.push({
        key: "highlight",
        tone: highlightTone,
        eyebrow: "O que você mais valoriza",
        content: (
          <div className="space-y-3">
            <p className="font-display text-5xl sm:text-7xl">{highlightLabel}</p>
            <p className="text-sm font-bold uppercase tracking-wide">
              destacado em {stats.topHighlight.count}{" "}
              {stats.topHighlight.count === 1 ? "avaliação" : "avaliações"}
            </p>
          </div>
        ),
      });
    }

    const topMovieTone = TONE_ROTATION[list.length % TONE_ROTATION.length];
    list.push({
      key: "top-movie",
      tone: topMovieTone,
      eyebrow: "O filme que você mais amou",
      content: (
        <div className="space-y-4">
          <div>
            {renderMovie(stats.topMovie.movieId, MOVIE_LINK_BY_TONE[topMovieTone])}
          </div>
          <p className="text-sm font-bold uppercase tracking-wide">
            Nota {formatRating(stats.topMovie.rating)} / 5
          </p>
        </div>
      ),
    });

    if (archetype) {
      // O cartaz do arquétipo segue sempre o bloco osso da SPEC-UI-01 §6.7.
      list.push({
        key: "archetype",
        tone: "osso",
        eyebrow: "Seu arquétipo",
        content: (
          <div className="space-y-4">
            <p className="font-display text-5xl sm:text-7xl">{archetype.title}</p>
            <p className="max-w-xl border-t-2 border-background pt-3 text-base font-medium">
              {archetype.description}
            </p>
          </div>
        ),
      });
    }

    return list;
  }, [stats, reviews.length, archetype, renderMovie]);

  const maxIndex = Math.max(0, slides.length - 1);
  const safeIndex = Math.min(currentIndex, maxIndex);

  useEffect(() => {
    if (slides.length === 0) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  const activeSlide = slides[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === slides.length - 1;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <nav aria-label="Navegação secundária">
        <Link
          href={profileHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-primary-text underline-offset-4 hover:underline"
        >
          <ArrowLeftIcon />
          Voltar ao perfil
        </Link>
      </nav>

      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          Máquina do Tempo
        </p>
        <h1 className="font-display text-4xl text-foreground sm:text-6xl">
          A jornada de {displayName}
        </h1>
      </header>

      {!stats || !activeSlide ? (
        <div className="space-y-6 py-6">
          <StateMessage
            title="A Máquina do Tempo aparece a partir de 3 avaliações."
            description="Quando esta conta alcançar pelo menos 3 avaliações publicadas, sua retrospectiva ficará disponível aqui."
          />
          <div className="text-center">
            <Link
              href={profileHref}
              className="inline-flex min-h-11 items-center justify-center rounded-card bg-primary px-6 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-primary-foreground"
            >
              Voltar ao perfil
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <article
            aria-live="polite"
            aria-atomic="true"
            className={`flex min-h-80 flex-col justify-between rounded-card border-2 p-6 sm:min-h-96 sm:p-10 ${TONE_CLASSES[activeSlide.tone]}`}
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-current pb-3">
              <span className="text-xs font-bold uppercase tracking-wide">
                {activeSlide.eyebrow}
              </span>
              <span className="text-xs font-bold uppercase tracking-wide">
                {safeIndex + 1} de {slides.length}
              </span>
            </div>

            <div className="py-6">{activeSlide.content}</div>

            <div className="text-xs font-bold uppercase tracking-wide opacity-80">
              LogBuster · Retrospectiva do cinéfilo
            </div>
          </article>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              disabled={isFirst}
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              className="min-h-11 cursor-pointer rounded-card border-2 border-foreground px-5 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:border-border disabled:text-subtle"
            >
              Anterior
            </button>

            <span className="text-sm font-bold uppercase tracking-wide text-muted">
              Cartaz {safeIndex + 1} de {slides.length}
            </span>

            {isLast ? (
              <Link
                href={profileHref}
                className="inline-flex min-h-11 items-center justify-center rounded-card bg-primary px-6 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-primary-foreground"
              >
                Voltar ao perfil
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))
                }
                className="min-h-11 cursor-pointer rounded-card bg-primary px-6 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-primary-foreground"
              >
                Próximo
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
