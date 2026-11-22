import { env } from "@/shared/config/env";
import { backendApi } from "@/shared/api/clients";
import type { ReviewSummary } from "../types";
import { fetchReviewSummaryMock } from "./reviewAi.mock";

/**
 * Teto do resumo. O backend leva até ~21 s para gerar (texto + checagem de spoiler do
 * próprio resumo); passou disso, o bloco mostra "indisponível" em vez de carregar para sempre.
 */
export const REVIEW_SUMMARY_TIMEOUT_MS = 30_000;

export type BackendReviewSummaryResponse = {
  movie_id?: string;
  status?: string;
  text?: string | null;
  /** UTC. */
  generated_at?: string | null;
};

/** Converte a resposta do backend. Qualquer formato inesperado vira "unavailable". */
export function toReviewSummary(data: BackendReviewSummaryResponse): ReviewSummary {
  if (data.status === "insufficient_reviews") return { status: "insufficient_reviews" };

  if (data.status === "ready" && typeof data.text === "string" && data.text.trim()) {
    return {
      status: "ready",
      text: data.text.trim(),
      generatedAt: data.generated_at ?? "",
    };
  }

  return { status: "unavailable" };
}

/** Requisições de resumo em andamento, por filme. */
const summaryRequests = new Map<string, Promise<ReviewSummary>>();

function requestReviewSummary(movieId: string): Promise<ReviewSummary> {
  const pending = summaryRequests.get(movieId);
  if (pending) return pending;

  // O cancelamento de quem chamou não passa por aqui: a requisição é compartilhada.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REVIEW_SUMMARY_TIMEOUT_MS);

  const request = backendApi
    .request<BackendReviewSummaryResponse>(
      `/api/v1/movies/${encodeURIComponent(movieId)}/review-summary`,
      { signal: controller.signal },
    )
    .then(toReviewSummary)
    .catch((): ReviewSummary => ({ status: "unavailable" }))
    .finally(() => {
      clearTimeout(timer);
      summaryRequests.delete(movieId);
    });

  summaryRequests.set(movieId, request);
  return request;
}

function abortError() {
  return new DOMException("Aborted", "AbortError");
}

/** Faz só este chamador desistir da espera, sem cancelar a requisição compartilhada. */
function rejectWhenAborted<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}

/**
 * Resumo da comunidade (IA) de um filme. Chamado separado da ficha: a primeira
 * geração leva alguns segundos e depois vem do cache.
 *
 * Nunca lança por falha: erro de rede ou do servidor e timeout (30 s) viram "unavailable"
 * para a ficha seguir normal. Só o cancelamento (`AbortError`) é propagado, para o hook
 * ignorar a resposta.
 *
 * Chamadas simultâneas para o mesmo filme compartilham uma única requisição. Isso importa
 * porque o backend responde "unavailable" a quem chega durante uma geração em andamento,
 * e o React (modo de desenvolvimento) executa os efeitos duas vezes.
 */
export async function fetchReviewSummary(
  movieId: string,
  signal?: AbortSignal,
): Promise<ReviewSummary> {
  if (signal?.aborted) throw abortError();

  if (env.useApiMocks) {
    return fetchReviewSummaryMock(movieId);
  }

  return rejectWhenAborted(requestReviewSummary(movieId), signal);
}
