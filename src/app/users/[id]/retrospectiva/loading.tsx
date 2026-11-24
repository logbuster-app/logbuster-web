export default function TimeMachineLoading() {
  return (
    <div
      className="mx-auto max-w-3xl space-y-6 py-6 sm:py-8 animate-pulse"
      aria-busy="true"
      aria-label="Carregando Máquina do Tempo"
    >
      <div className="h-4 w-36 bg-surface-raised" />
      <div className="space-y-2">
        <div className="h-3 w-28 bg-surface-raised" />
        <div className="h-12 w-80 bg-surface-raised" />
      </div>
      <div className="h-80 w-full rounded-card border-2 border-border bg-surface-raised sm:h-96" />
      <div className="flex items-center justify-between">
        <div className="h-11 w-28 bg-surface-raised" />
        <div className="h-4 w-24 bg-surface-raised" />
        <div className="h-11 w-28 bg-surface-raised" />
      </div>
    </div>
  );
}
