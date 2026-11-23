"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/shared/lib/errors";
import { createReview } from "../api/reviews";
import type { CreateReviewInput, Review } from "../types";

/** Envio de uma nova avaliação: estado de envio e mensagem de erro para o modal. */
export function useCreateReview() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  /** Retorna a avaliação criada, ou `null` em caso de falha (o erro fica em `error`). */
  const submit = useCallback(async (input: CreateReviewInput): Promise<Review | null> => {
    setSubmitting(true);
    setError(null);
    setUnauthorized(false);
    try {
      return await createReview(input);
    } catch (err) {
      setUnauthorized(err instanceof ApiError && err.status === 401);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível publicar sua avaliação. Tente novamente.",
      );
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setUnauthorized(false);
  }, []);

  return { submit, submitting, error, unauthorized, clearError };
}
