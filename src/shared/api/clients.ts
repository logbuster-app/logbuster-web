import { env } from "@/shared/config/env";
import { createApiClient } from "@/shared/lib/apiClient";
import { getVisitorId } from "@/shared/lib/visitor";
import { clearSession, getAccessToken } from "@/shared/lib/session";

/**
 * Instâncias únicas do cliente HTTP. Os services de cada feature importam DAQUI;
 * ninguém chama `fetch` nem `createApiClient` fora desta pasta.
 */

/** Rotas internas do Next.js (`/api/*`, mesma origem). Uso no navegador. */
export const internalApi = createApiClient();

/** Backend FastAPI do LogBuster. Envia `X-Visitor-Id` automaticamente (uso no navegador). */
export const backendApi = createApiClient({
  baseUrl: env.apiBaseUrl,
  headers: (): Record<string, string> => {
    if (typeof window === "undefined") return {};

    const headers: Record<string, string> = {
      "X-Visitor-Id": getVisitorId(),
    };
    const accessToken = getAccessToken();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return headers;
  },
  onError: (error, sentAuthorization) => {
    if (error.status === 401 && sentAuthorization) clearSession();
  },
});
