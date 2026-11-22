"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CloseIcon } from "@/shared/components/CloseIcon";
import { WarningIcon } from "@/shared/components/WarningIcon";
import { useModalBehavior } from "@/shared/hooks/useModalBehavior";
import { useCreateReview } from "../hooks/useCreateReview";
import { useSpoilerCheck } from "../hooks/useSpoilerCheck";
import type { CreateReviewInput, Review, ReviewHighlight } from "../types";
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
 *
 * Ao publicar, a IA sugere se o texto parece spoiler (só sugere: o autor decide).
 * "suspected" mostra o aviso; "clear" e "unavailable" (inclui timeout) publicam direto.
 */
export function ReviewModal({ movieId, onClose, onCreated }: ReviewModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  // O modal só é montado no navegador (após o clique), então ler o storage aqui é seguro.
  const [authorName, setAuthorName] = useState(readSavedAuthorName);
  const [rating, setRating] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<ReviewHighlight[]>([]);
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  // Avaliação aguardando a decisão do autor sobre o aviso de spoiler.
  const [spoilerPrompt, setSpoilerPrompt] = useState<CreateReviewInput | null>(null);
  // Texto sobre o qual o autor já decidiu: não pergunta de novo se a publicação falhar.
  const decidedContentRef = useRef<string | null>(null);
  const { submit, submitting, error: submitError, clearError } = useCreateReview();
  const { check: checkSpoiler, checking } = useSpoilerCheck();
  const busy = submitting || checking;

  // Ao fechar o aviso de spoiler sem publicar, o foco volta para o texto.
  const promptWasOpenRef = useRef(false);
  useEffect(() => {
    if (spoilerPrompt === null && promptWasOpenRef.current) contentRef.current?.focus();
    promptWasOpenRef.current = spoilerPrompt !== null;
  }, [spoilerPrompt]);

  // Há algo a perder? O nome vem preenchido do último uso, então não conta.
  const hasUnsavedWork =
    rating !== null || content.trim().length > 0 || highlights.length > 0 || isSpoiler;

  /** Fechar com texto digitado pede confirmação; Esc de novo volta a escrever. */
  function requestClose() {
    if (busy) return;
    if (spoilerPrompt) {
      setSpoilerPrompt(null);
      return;
    }
    if (confirmingDiscard) {
      setConfirmingDiscard(false);
      return;
    }
    if (hasUnsavedWork) {
      setConfirmingDiscard(true);
      return;
    }
    onClose();
  }

  useModalBehavior(dialogRef, { onClose: requestClose, canClose: !busy });

  const error = validationError ?? submitError;

  async function publish(input: CreateReviewInput) {
    setSpoilerPrompt(null);
    const review = await submit(input);
    if (!review) return;
    saveAuthorName(input.authorName);
    onCreated(review);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    const result = validateReview({ movieId, rating, authorName, content, isSpoiler, highlights });
    if (!result.ok) {
      setValidationError(result.error);
      return;
    }
    setValidationError(null);

    // Já marcada como spoiler, ou já decidida pelo autor: não há o que sugerir.
    const needsCheck = !result.input.isSpoiler && decidedContentRef.current !== result.input.content;
    if (needsCheck) {
      const verdict = await checkSpoiler(movieId, result.input.content);
      if (verdict === "suspected") {
        setSpoilerPrompt(result.input);
        return;
      }
    }

    await publish(result.input);
  }

  /** Autor aceitou a sugestão: publica com `is_spoiler: true` e reflete no checkbox. */
  async function handleMarkAsSpoiler() {
    if (!spoilerPrompt) return;
    decidedContentRef.current = spoilerPrompt.content;
    setIsSpoiler(true);
    await publish({ ...spoilerPrompt, isSpoiler: true });
  }

  /** Autor recusou a sugestão: publica com `is_spoiler: false`. */
  async function handlePublishAnyway() {
    if (!spoilerPrompt) return;
    decidedContentRef.current = spoilerPrompt.content;
    await publish({ ...spoilerPrompt, isSpoiler: false });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/90 p-3 sm:p-6">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="my-auto w-full max-w-xl rounded-card border-2 border-foreground bg-surface"
      >
        <header className="flex items-center justify-between gap-4 border-b-2 border-foreground px-5 py-3">
          <h2 id="review-modal-title" className="font-display text-3xl text-foreground">
            Avaliar filme
          </h2>
          <button
            type="button"
            aria-label="Fechar avaliação"
            disabled={busy}
            onClick={requestClose}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-card text-foreground hover:bg-surface-raised hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {confirmingDiscard ? (
            <div role="alert" className="space-y-4 rounded-card border-2 border-warning bg-background p-4">
              <p className="font-display text-2xl text-warning">Descartar sua análise?</p>
              <p className="text-sm text-muted">
                O que você escreveu será perdido. Esta ação não pode ser desfeita.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-6">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirmingDiscard(false)}
                  className="min-h-11 cursor-pointer rounded-card bg-primary px-5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary-hover"
                >
                  Continuar escrevendo
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-11 cursor-pointer rounded-card border-2 border-border px-5 text-sm font-bold uppercase tracking-wide text-muted hover:border-warning hover:text-warning"
                >
                  Descartar
                </button>
              </div>
            </div>
          ) : null}

          {spoilerPrompt ? (
            <div role="alert" className="space-y-4 rounded-card border-2 border-warning bg-background p-4">
              <p className="flex items-center gap-2 font-display text-2xl text-warning">
                <WarningIcon className="size-6 shrink-0" />
                <span>Seu texto parece conter spoiler. Quer marcar como spoiler?</span>
              </p>
              <p className="text-sm text-muted">
                É só uma sugestão: a decisão é sua e nada é ocultado automaticamente.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  autoFocus
                  disabled={submitting}
                  onClick={handleMarkAsSpoiler}
                  className="min-h-11 cursor-pointer rounded-card bg-primary px-5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
                >
                  Marcar como spoiler
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePublishAnyway}
                  className="min-h-11 cursor-pointer rounded-card border-2 border-border px-5 text-sm font-bold uppercase tracking-wide text-muted hover:border-foreground hover:text-foreground disabled:cursor-wait disabled:opacity-60"
                >
                  Publicar assim mesmo
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setSpoilerPrompt(null)}
                  className="min-h-11 cursor-pointer px-2 text-sm font-semibold uppercase tracking-wide text-primary-text underline-offset-4 hover:underline disabled:opacity-60"
                >
                  Voltar e editar
                </button>
              </div>
            </div>
          ) : null}

          {error ? (
            <div role="alert" className="rounded-card border-2 border-danger bg-background p-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          {/* Campos bloqueados durante a análise/publicação e com o aviso de spoiler aberto:
              o aviso vale para o texto que o autor viu, então ele não pode mudar por baixo. */}
          <fieldset
            disabled={busy || spoilerPrompt !== null}
            className="m-0 min-w-0 space-y-5 border-0 p-0 transition-opacity disabled:opacity-60"
          >
            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wide text-foreground">
                Sua nota <span className="text-danger">*</span>
              </span>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>

            <HighlightPicker value={highlights} onChange={setHighlights} />

            <div className="space-y-1.5">
              <label htmlFor="review-author-name" className="block text-xs font-bold uppercase tracking-wide text-foreground">
                Nome / apelido <span className="text-danger">*</span>
              </label>
              <input
                id="review-author-name"
                value={authorName}
                onChange={(event) => setAuthorName(event.target.value)}
                autoFocus
                maxLength={REVIEW_LIMITS.authorName.max}
                autoComplete="nickname"
                className="h-11 w-full rounded-card border-2 border-border bg-background px-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-foreground"
              />
              <p className="text-xs text-muted">De 2 a 50 caracteres.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="review-content" className="block text-xs font-bold uppercase tracking-wide text-foreground">
                Sua análise <span className="text-danger">*</span>
              </label>
              <textarea
                id="review-content"
                ref={contentRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={REVIEW_LIMITS.content.max}
                rows={5}
                className="font-reading w-full resize-y rounded-card border-2 border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-subtle focus-visible:border-foreground"
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
          </fieldset>

          <footer className="flex flex-col-reverse gap-3 border-t-2 border-border pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={requestClose}
              className="min-h-11 cursor-pointer rounded-card border-2 border-border px-5 text-sm font-bold uppercase tracking-wide text-muted hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy || spoilerPrompt !== null}
              className="min-h-11 cursor-pointer rounded-card bg-primary px-5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
            >
              {checking ? "Verificando..." : submitting ? "Publicando..." : "Publicar avaliação"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}