export default function UserProfileLoading() {
  return (
    <div
      className="space-y-8 py-6 sm:py-8 animate-pulse"
      aria-busy="true"
      aria-label="Carregando perfil"
    >
      <div className="aspect-[16/9] max-h-56 w-full rounded-card border-2 border-border bg-surface-raised sm:max-h-72" />
      <div className="-mt-16 px-4 sm:-mt-20 sm:px-6">
        <div className="size-24 rounded-card border-2 border-border bg-surface-raised sm:size-32" />
      </div>
      <div className="space-y-3">
        <div className="h-12 w-64 bg-surface-raised" />
        <div className="h-4 w-44 bg-surface-raised" />
        <div className="h-5 w-full max-w-xl bg-surface-raised" />
        <div className="h-20 w-full max-w-lg rounded-card border-2 border-border bg-surface-raised" />
      </div>
      <hr className="border-t-2 border-border" />
      <div className="space-y-4">
        <div className="h-9 w-56 bg-surface-raised" />
        <div className="h-32 rounded-card border-2 border-border bg-surface-raised" />
      </div>
    </div>
  );
}
