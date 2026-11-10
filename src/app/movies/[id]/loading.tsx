export default function MovieDetailLoading() {
  return (
    <div className="py-6 sm:py-8 space-y-6 animate-pulse" aria-busy="true" aria-label="Carregando detalhes do filme">
      {/* Botão voltar skeleton */}
      <div className="h-4 w-36 bg-surface-raised" />

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
          {/* Pôster skeleton (proporção 2:3) */}
          <div className="relative aspect-[2/3] w-full max-w-[280px] mx-auto md:mx-0 rounded-card border-2 border-border bg-surface-raised" />

          {/* Dados do filme skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-14 w-3/4 max-w-md bg-surface-raised" />
              <div className="h-5 w-48 bg-surface-raised" />
            </div>

            {/* Etiqueta da nota */}
            <div className="h-8 w-60 bg-surface-raised" />

            {/* Sinopse */}
            <div className="space-y-2 pt-2">
              <div className="h-5 w-full bg-surface-raised" />
              <div className="h-5 w-11/12 bg-surface-raised" />
              <div className="h-5 w-2/3 bg-surface-raised" />
            </div>

            {/* Equipe / Elenco */}
            <div className="space-y-3 pt-3">
              <div className="h-4 w-48 bg-surface-raised" />
              <div className="h-4 w-64 bg-surface-raised" />
            </div>
          </div>
        </div>

        {/* Separador */}
        <hr className="border-t-2 border-border" />

        {/* Seção de avaliações skeleton */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="h-8 w-56 bg-surface-raised" />
              <div className="h-3 w-64 bg-surface-raised" />
            </div>
            <div className="h-11 w-36 bg-surface-raised" />
          </div>

          <div className="space-y-4">
            <div className="h-32 rounded-card border-2 border-border bg-surface-raised" />
            <div className="h-32 rounded-card border-2 border-border bg-surface-raised" />
          </div>
        </div>
      </div>
    </div>
  );
}
