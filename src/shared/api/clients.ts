import { env } from "@/shared/config/env";
import { createApiClient } from "@/shared/lib/apiClient";
import { getVisitorId } from "@/shared/lib/visitor";

/**
 * Instâncias únicas do cliente HTTP. Os services de cada feature importam DAQUI;
 * ninguém chama `fetch` nem `createApiClient` fora desta pasta.
 */

/** Rotas internas do Next.js (`/api/*`, mesma origem). Uso no navegador. */
export const internalApi = createApiClient();

/** Backend FastAPI do LogBuster. Envia `X-Visitor-Id` automaticamente (uso no navegador). */
export const backendApi = createApiClient({
  baseUrl: env.apiBaseUrl,
  headers: () => ({ "X-Visitor-Id": getVisitorId() }),
});
