import { ApiError } from "./errors";

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  /** Objeto serializado como JSON (`Content-Type: application/json`) ou arquivo/binário (`Blob`/`File`) enviado direto. */
  body?: unknown;
  signal?: AbortSignal;
  /** Mensagem exibida em falhas de rede. */
  networkMessage?: string;
  /** Mensagem exibida quando o servidor responde com erro. Sem ela, usa `error`/`detail` do corpo. */
  errorMessage?: string;
  /** Quando true, remove Authorization também quando o cliente tiver headers padrão autenticados. */
  skipAuth?: boolean;
};

export type ApiClientConfig = {
  /** Origem da API. Vazio = mesma origem (rotas internas do Next.js). */
  baseUrl?: string;
  /** Headers enviados em toda requisição. Pode ser função, avaliada a cada chamada (ex.: id do visitante). */
  headers?: Record<string, string> | (() => Record<string, string>);
  /** Chamado antes de lançar qualquer `ApiError` (log, tratar 401/429 num só lugar). */
  onError?: (error: ApiError, sentAuthorization: boolean) => void;
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

/** Extrai a mensagem do envelope padrão ou do erro simples do FastAPI. */
async function readErrorMessage(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { error?: unknown; detail?: unknown };
    const error = data?.error;
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }
    if (typeof error === "string") return error;
    if (typeof data?.detail === "string") return data.detail;
  } catch {
    // corpo ausente ou não-JSON
  }
  return null;
}

function isBinaryBody(body: unknown): body is Blob | ArrayBuffer | ArrayBufferView {
  return (
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  );
}

/**
 * Cliente HTTP único do front: base URL, headers padrão, JSON/binário, cancelamento e
 * conversão de falhas em `ApiError` (`network` | `upstream`, com `status`).
 */
export function createApiClient({ baseUrl = "", headers: defaults = {}, onError }: ApiClientConfig = {}) {
  function fail(error: ApiError, sentAuthorization = false): never {
    onError?.(error, sentAuthorization);
    throw error;
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = "GET",
      query,
      headers,
      body,
      signal,
      networkMessage,
      errorMessage,
      skipAuth = false,
    } = options;

    const defaultHeaders =
      typeof defaults === "function" ? defaults() : defaults;
    const finalHeaders: Record<string, string> = {
      Accept: "application/json",
      ...(skipAuth ? {} : defaultHeaders),
      ...headers,
    };

    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      if (isBinaryBody(body)) {
        if (!finalHeaders["Content-Type"] && body instanceof Blob && body.type) {
          finalHeaders["Content-Type"] = body.type;
        }
        requestBody = body as BodyInit;
      } else {
        finalHeaders["Content-Type"] = "application/json";
        requestBody = JSON.stringify(body);
      }
    }

    const sentAuthorization = typeof finalHeaders.Authorization === "string";

    let res: Response;
    try {
      res = await fetch(buildUrl(baseUrl, path, query), {
        method,
        headers: finalHeaders,
        body: requestBody,
        signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      return fail(new ApiError(networkMessage ?? "Não foi possível conectar ao servidor.", "network"), sentAuthorization);
    }

    if (!res.ok) {
      const message =
        errorMessage ?? (await readErrorMessage(res)) ?? "O servidor retornou um erro inesperado.";
      return fail(new ApiError(message, "upstream", res.status), sentAuthorization);
    }

    if (res.status === 204 || res.status === 205) {
      return undefined as T;
    }

    if (typeof res.text === "function") {
      const raw = await res.text();
      if (!raw.trim()) return undefined as T;
      return JSON.parse(raw) as T;
    }

    return (await res.json()) as T;
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;
