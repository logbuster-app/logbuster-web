"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/shared/components/Spinner";
import { StateMessage } from "@/shared/components/StateMessage";
import { HIGHLIGHT_LABELS, isHighlight, type Highlight } from "@/shared/lib/highlights";
import { useHighlightedMovies } from "../../hooks/useHighlightedMovies";
import { MovieGrid } from "../search/MovieGrid";
import { HighlightChips } from "./HighlightChips";

/**
 * "Destaques da comunidade": a pessoa escolhe um aspecto e vê os filmes que a
 * comunidade mais elogiou nele. O aspecto fica na URL (`?destaque=soundtrack`).
 * Aparece na home só quando não há busca; falha aqui nunca afeta a busca.
 */
export function HighlightsSection() {
  const router = useRouter();
  const param = useSearchParams().get("destaque");
  const requested = isHighlight(param) ? param : null;
  const { status, selected, movies } = useHighlightedMovies(requested);

  function select(highlight: Highlight) {
    router.replace(`/?destaque=${highlight}`, { scroll: false });
  }

  const label = selected ? HIGHLIGHT_LABELS[selected] : "";

  /** Legenda de cada card: quantas avaliações destacaram este aspecto naquele filme. */
  function captionFor(movie: { highlightCount: number }) {
    const noun = movie.highlightCount === 1 ? "destaque" : "destaques";
    return `${movie.highlightCount} ${noun} em ${label}`;
  }

  return (
    <section aria-labelledby="highlights-title" className="space-y-6">
      <div className="space-y-2">
        <h2 id="highlights-title" className="font-display text-4xl">
          Destaques da comunidade
        </h2>
        <p className="text-sm text-muted">
          Escolha um aspecto e veja os filmes que a comunidade mais elogiou nele.
        </p>
      </div>

      <HighlightChips selected={selected} onSelect={select} />

      <div aria-busy={status === "loading"} className="space-y-6">
        {status === "loading" && <Spinner label="Carregando destaques" />}
        {status === "error" && (
          <StateMessage
            title="Não foi possível carregar os destaques"
            description="Eles não estão disponíveis agora. A busca continua funcionando."
          />
        )}
        {status === "success" && movies.length === 0 && (
          <StateMessage
            title={`Ninguém destacou ${label} ainda…`}
            description="Avalie um filme e escolha esse ponto de destaque para ele aparecer aqui."
          />
        )}
        {status === "success" && movies.length > 0 && (
          <MovieGrid movies={movies} getCaption={captionFor} />
        )}
      </div>
    </section>
  );
}
