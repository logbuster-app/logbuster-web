import { Suspense } from "react";
import type { Metadata } from "next";
import { MovieSearch } from "@/features/movies";

export const metadata: Metadata = {
  title: "Buscar Filmes | LogBuster",
  description:
    "Pesquise filmes por título, veja avaliações qualificadas e registre suas opiniões no LogBuster.",
};

function SearchFallback() {
  return (
    <section className="space-y-8 animate-pulse" aria-busy="true">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-surface-raised" />
        <div className="h-4 w-80 rounded bg-surface-raised" />
      </div>
      <div className="h-12 w-full max-w-2xl rounded-card bg-surface-raised border border-border" />
    </section>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <MovieSearch />
    </Suspense>
  );
}
