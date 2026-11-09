"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/shared/components/Spinner";
import { StateMessage } from "@/shared/components/StateMessage";
import { useMovieSearch } from "../../hooks/useMovieSearch";
import { MovieGrid } from "./MovieGrid";
import { SearchBar } from "./SearchBar";

/** Tela de busca: a consulta fica na URL (?q=) para ser compartilhável. */
export function MovieSearch() {
  const router = useRouter();
  const query = useSearchParams().get("q")?.trim() ?? "";
  const { status, movies, total, error, hasMore, loadMore, loadingMore, moreError } =
    useMovieSearch(query);

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Encontre um filme</h1>
        <p className="text-muted">Busque pelo título e comece a registrar o que você assistiu.</p>
      </div>

      <SearchBar
        key={query}
        initialValue={query}
        onSearch={(q) => router.push(`/?q=${encodeURIComponent(q)}`)}
      />

      {status === "idle" && (
        <StateMessage
          title="Comece sua busca"
          description="Digite o título de um filme acima para ver os resultados."
        />
      )}
      {status === "loading" && <Spinner label="Buscando filmes" />}
      {status === "error" && (
        <StateMessage
          tone="danger"
          title="Não foi possível buscar"
          description={error ?? undefined}
        />
      )}
      {status === "success" && movies.length === 0 && (
        <StateMessage
          title="Nenhum filme encontrado"
          description={`Não achamos resultados para "${query}". Tente outro título.`}
        />
      )}
      {status === "success" && movies.length > 0 && (
        <div className="space-y-6">
          <p className="text-sm text-muted">
            {total} {total === 1 ? "resultado" : "resultados"} para &quot;{query}&quot;
          </p>
          <MovieGrid movies={movies} />
          {moreError && <StateMessage tone="danger" title={moreError} />}
          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="h-11 rounded-card border border-border bg-surface-raised px-6 font-semibold transition-colors hover:border-primary-text disabled:opacity-60"
              >
                {loadingMore ? "Carregando…" : "Carregar mais"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
