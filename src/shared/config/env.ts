/**
 * Variáveis de ambiente da aplicação.
 *
 * - `OMDB_*` são privadas: existem só no servidor (Route Handlers e Server Components).
 *   Nunca use o prefixo `NEXT_PUBLIC_` para a chave da OMDb, pois ele a embute no bundle do navegador.
 * - `NEXT_PUBLIC_*` é embutida no bundle do cliente e só deve conter dados não sensíveis.
 */
export const env = {
  /** Chave da OMDb (somente servidor). */
  omdbApiKey: process.env.OMDB_API_KEY ?? "",
  omdbBaseUrl: process.env.OMDB_BASE_URL || "https://www.omdbapi.com",
  /** Backend do LogBuster (FastAPI), chamado pelo navegador pela feature `reviews`. */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  /** Flag para alternar entre dados mockados e backend real na camada de API. */
  useApiMocks: process.env.NEXT_PUBLIC_USE_API_MOCKS === "true",
};
