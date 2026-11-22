"use client";

import { Spinner } from "@/shared/components/Spinner";
import { formatLocalDateTime, parseUtcDate } from "@/shared/lib/format";
import { useReviewSummary } from "../hooks/useReviewSummary";

export type ReviewSummaryProps = {
  movieId: string;
};

/**
 * Bloco "Resumo da comunidade" da ficha do filme (texto gerado por IA).
 * Carrega por conta própria: nunca bloqueia nem quebra o resto da ficha.
 * Menos de 3 avaliações = o bloco não é exibido.
 */
export function ReviewSummary({ movieId }: ReviewSummaryProps) {
  const state = useReviewSummary(movieId);

  if (state.status === "hidden") return null;

  const generatedAt = state.status === "ready" ? parseUtcDate(state.generatedAt) : null;

  return (
    <section
      aria-labelledby="review-summary-title"
      aria-busy={state.status === "loading"}
      className="space-y-3 rounded-card border-2 border-border bg-surface p-5"
    >
      <h2 id="review-summary-title" className="font-display text-2xl text-foreground">
        Resumo da comunidade
      </h2>

      {state.status === "loading" ? (
        <div className="space-y-1">
          <Spinner label="Gerando o resumo da comunidade" />
          <p className="text-xs text-muted">A primeira geração pode levar alguns segundos.</p>
        </div>
      ) : null}

      {state.status === "unavailable" ? (
        <p className="text-sm text-muted">O resumo da comunidade está indisponível no momento.</p>
      ) : null}

      {state.status === "ready" ? (
        <>
          <p className="font-reading max-w-[68ch] text-lg text-foreground">{state.text}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold uppercase tracking-wide text-muted">
            <span className="border border-border bg-surface-raised px-2.5 py-1 text-foreground">
              Gerado por IA
            </span>
            {generatedAt ? (
              <span>
                Gerado em{" "}
                <time dateTime={generatedAt.toISOString()}>{formatLocalDateTime(generatedAt)}</time>
              </span>
            ) : null}
          </p>
        </>
      ) : null}
    </section>
  );
}
