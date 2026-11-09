export default function MovieDetailLoading() {
  return (
    <div className="py-6 sm:py-8 space-y-6 animate-pulse" aria-busy="true" aria-label="Carregando detalhes do filme">
      {/* Botão voltar skeleton */}
      <div className="h-4 w-36 rounded bg-surface-raised" />

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Pôster skeleton (proporção 2:3) */}
          <div className="relative aspect-[2/3] w-full max-w-[240px] mx-auto md:mx-0 rounded-card border border-border bg-surface-raised" />

          {/* Dados do filme skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-8 w-3/4 max-w-md rounded bg-surface-raised" />
              <div className="h-5 w-24 rounded bg-surface-raised" />
            </div>

            {/* Badges / Gêneros */}
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-16 rounded-full bg-surface-raised" />
              <div className="h-6 w-20 rounded-full bg-surface-raised" />
              <div className="h-6 w-16 rounded-full bg-surface-raised" />
            </div>

            {/* Sinopse */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full rounded bg-surface-raised" />
              <div className="h-4 w-11/12 rounded bg-surface-raised" />
              <div className="h-4 w-2/3 rounded bg-surface-raised" />
            </div>

            {/* Equipe / Elenco */}
            <div className="space-y-3 pt-3">
              <div className="h-4 w-48 rounded bg-surface-raised" />
              <div className="h-4 w-64 rounded bg-surface-raised" />
            </div>
          </div>
        </div>

        {/* Separador */}
        <hr className="border-border" />

        {/* Seção de avaliações skeleton */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="h-6 w-48 rounded bg-surface-raised" />
              <div className="h-3 w-64 rounded bg-surface-raised" />
            </div>
            <div className="h-9 w-36 rounded bg-surface-raised" />
          </div>

          <div className="space-y-4">
            <div className="h-32 rounded-card border border-border bg-surface-raised" />
            <div className="h-32 rounded-card border border-border bg-surface-raised" />
          </div>
        </div>
      </div>
    </div>
  );
}
