import { ApiError } from "./errors";

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  /** Objeto serializado como JSON (adiciona `Content-Type: application/json`). */
  body?: unknown;
  signal?: AbortSignal;
  /** Mensagem exibida em falhas de rede. */
  networkMessage?: string;
  /** Mensagem exibida quando o servidor responde com erro. Sem ela, usa `error`/`detail` do corpo. */
  errorMessage?: string;
};

export type ApiClientConfig = {
  /** Origem da API. Vazio = mesma origem (rotas internas do Next.js). */
  baseUrl?: string;
  /** Headers enviados em toda requisição. Pode ser função, avaliada a cada chamada (ex.: id do visitante). */
  headers?: Record<string, string> | (() => Record<string, string>);
  /** Chamado antes de lançar qualquer `ApiError` (log, tratar 401/429 num só lugar). */
  onError?: (error: ApiError) => void;
};

function buildUrl(baseUrl: string, path: string, query?: RequestOptions["query"]): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const qs = params.toString();

  if (!baseUrl) return qs ? `${path}?${qs}` : path;

  const url = new URL(path, baseUrl);
  if (qs) url.search = qs;
  return url.toString();
}

/** Extrai uma mensagem legível do corpo de erro (`{ error }` ou `{ detail }` do FastAPI). */
async function readErrorMessage(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { error?: unknown; detail?: unknown };
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.detail === "string") return data.detail;
  } catch {
    // corpo ausente ou não-JSON
  }
  return null;
}

/**
 * Cliente HTTP único do front: base URL, headers padrão, JSON, cancelamento e
 * conversão de falhas em `ApiError` (`network` | `upstream`, com `status`).
 */
export function createApiClient({ baseUrl = "", headers: defaults = {}, onError }: ApiClientConfig = {}) {
  function fail(error: ApiError): never {
    onError?.(error);
    throw error;
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", query, headers, body, signal, networkMessage, errorMessage } = options;

    const finalHeaders: Record<string, string> = {
      Accept: "application/json",
      ...(typeof defaults === "function" ? defaults() : defaults),
      ...headers,
    };
    if (body !== undefined) finalHeaders["Content-Type"] = "application/json";

    let res: Response;
    try {
      res = await fetch(buildUrl(baseUrl, path, query), {
        method,
        headers: finalHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      return fail(new ApiError(networkMessage ?? "Não foi possível conectar ao servidor.", "network"));
    }

    if (!res.ok) {
      const message =
        errorMessage ?? (await readErrorMessage(res)) ?? "O servidor retornou um erro inesperado.";
      return fail(new ApiError(message, "upstream", res.status));
    }

    return (await res.json()) as T;
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;
