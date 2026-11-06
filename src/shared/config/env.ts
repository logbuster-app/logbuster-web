/**
 * Variáveis de ambiente públicas. No Next.js, `NEXT_PUBLIC_*` só é embutida no
 * bundle quando acessada por nome literal, por isso não usamos acesso dinâmico.
 */
export const env = {
  omdbApiKey: process.env.NEXT_PUBLIC_OMDB_API_KEY ?? "",
  omdbBaseUrl: process.env.NEXT_PUBLIC_OMDB_BASE_URL ?? "https://www.omdbapi.com",
  /** Backend do LogBuster (FastAPI). Usado pela feature `reviews` e pela nota média. */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
};
