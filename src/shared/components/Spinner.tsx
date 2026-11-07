export function Spinner({ label = "Carregando" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 text-muted">
      <span
        aria-hidden
        className="size-5 animate-spin rounded-full border-2 border-border border-t-primary-text"
      />
      <span>{label}…</span>
    </div>
  );
}
