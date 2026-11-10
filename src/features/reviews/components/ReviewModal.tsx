"use client";

import { useRef, useState, type FormEvent } from "react";
import { useModalBehavior } from "@/shared/hooks/useModalBehavior";
import { useCreateReview } from "../hooks/useCreateReview";
import type { Review, ReviewHighlight } from "../types";
import { REVIEW_LIMITS, validateReview } from "../validation";
import { HighlightPicker } from "./HighlightPicker";
import { StarRatingInput } from "./StarRatingInput";

const AUTHOR_NAME_STORAGE_KEY = "logbuster:review_author_name";

function readSavedAuthorName(): string {
  try {
    return window.localStorage.getItem(AUTHOR_NAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveAuthorName(name: string) {
  try {
    window.localStorage.setItem(AUTHOR_NAME_STORAGE_KEY, name);
  } catch {
    // A publicação não depende da persistência local do nome.
  }
}

export type ReviewModalProps = {
  movieId: string;
  onClose: () => void;
  onCreated: (review: Review) => void;
};

/**
 * Formulário de cadastro de avaliação (SPEC-FRONT-04).
 * Só fecha por `Escape`, "Cancelar" ou "×" — nunca por clique fora — para não
 * perder o texto digitado. Em falha, mantém todos os valores (RN-05).
 */
export function ReviewModal({ movieId, onClose, onCreated }: ReviewModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  // O modal só é montado no navegador (após o clique), então ler o storage aqui é seguro.
  const [authorName, setAuthorName] = useState(readSavedAuthorName);
  const [rating, setRating] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<ReviewHighlight[]>([]);
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { submit, submitting, error: submitError, clearError } = useCreateReview();

  useModalBehavior(dialogRef, { onClose, canClose: !submitting });

  const error = validationError ?? submitError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    const result = validateReview({ movieId, rating, authorName, content, isSpoiler, highlights });
    if (!result.ok) {
      setValidationError(result.error);
      return;
    }
    setValidationError(null);

    const review = await submit(result.input);
    if (!review) return;
    saveAuthorName(result.input.authorName);
    onCreated(review);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 p-3 sm:p-6">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="my-auto w-full max-w-xl rounded-card border border-border bg-surface shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 id="review-modal-title" className="text-lg font-semibold text-foreground">
            Avaliar filme
          </h2>
          <button
            type="button"
            aria-label="Fechar avaliação"
            disabled={submitting}
            onClick={onClose}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-card text-xl text-muted hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error ? (
            <div role="alert" className="rounded-card border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <span className="block text-sm font-medium text-foreground">
              Sua nota <span className="text-danger">*</span>
            </span>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <HighlightPicker value={highlights} onChange={setHighlights} />

          <div className="space-y-1.5">
            <label htmlFor="review-author-name" className="block text-sm font-medium text-foreground">
              Nome / apelido <span className="text-danger">*</span>
            </label>
            <input
              id="review-author-name"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              autoFocus
              maxLength={REVIEW_LIMITS.authorName.max}
              autoComplete="nickname"
              className="h-11 w-full rounded-card border border-border bg-background px-3 text-sm text-foreground placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
            />
            <p className="text-xs text-muted">De 2 a 50 caracteres.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="review-content" className="block text-sm font-medium text-foreground">
              Sua análise <span className="text-danger">*</span>
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={REVIEW_LIMITS.content.max}
              rows={5}
              className="w-full resize-y rounded-card border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
            />
            <p className="text-right text-xs text-muted" aria-live="polite">
              {content.trim().length} / 2000 (mínimo 10)
            </p>
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isSpoiler}
              onChange={(event) => setIsSpoiler(event.target.checked)}
              className="size-4 accent-primary"
            />
            Esta avaliação contém spoilers
          </label>

          <footer className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="min-h-11 cursor-pointer rounded-card border border-border px-4 text-sm font-medium text-muted hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-11 cursor-pointer rounded-card bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Publicando..." : "Publicar avaliação"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}