import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Log<span className="text-primary-text">Buster</span>
        </Link>
      </div>
    </header>
  );
}
