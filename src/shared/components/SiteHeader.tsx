import Link from "next/link";

/** Faixa vermelha cheia, como a tarja de um cartaz: o nome em letra condensada pesada. */
export function SiteHeader() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-4xl focus-visible:outline-primary-foreground"
        >
          Log<span className="text-foreground">Buster</span>
        </Link>
      </div>
    </header>
  );
}
