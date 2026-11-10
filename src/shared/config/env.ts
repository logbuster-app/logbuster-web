/**
 * Variáveis de ambiente da aplicação.
 *
 * - `NEXT_PUBLIC_*` é embutida no bundle do cliente e só deve conter dados não sensíveis.
 */
export const env = {
  /** Backend do LogBuster (FastAPI), usado pelas features de filmes e avaliações. */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  /** Flag para alternar entre dados mockados e backend real na camada de API. */
  useApiMocks: process.env.NEXT_PUBLIC_USE_API_MOCKS === "true",
};
