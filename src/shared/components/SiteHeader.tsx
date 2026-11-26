import Image from "next/image";
import Link from "next/link";
import { AccountMenu } from "./AccountMenu";

/** Faixa vermelha cheia, como a tarja de um cartaz, com a marca LogBuster colada sobre ela. */
export function SiteHeader() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="LogBuster, página inicial"
          className="flex items-center focus-visible:outline-primary-foreground"
        >
          <Image
            src="/brand/logbuster-wordmark.png"
            alt="LogBuster"
            width={1352}
            height={315}
            preload
            className="h-9 w-auto sm:h-10"
          />
        </Link>
        <AccountMenu />
      </div>
    </header>
  );
}
