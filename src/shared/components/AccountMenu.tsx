"use client";

import Link from "next/link";
import { useSession } from "../contexts/SessionContext";

export function AccountMenu() {
  const { viewer, signOut } = useSession();

  if (!viewer) {
    return (
      <nav aria-label="Conta" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
        <Link
          href="/login"
          className="min-h-11 cursor-pointer px-3 py-3 text-primary-foreground hover:text-foreground focus-visible:outline-primary-foreground"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="min-h-11 cursor-pointer border-2 border-primary-foreground px-3 py-2 text-primary-foreground hover:bg-primary-foreground hover:text-primary focus-visible:outline-primary-foreground"
        >
          Criar conta
        </Link>
      </nav>
    );
  }

  const initial = viewer.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <details className="relative">
      <summary
        aria-label={`Menu da conta de ${viewer.displayName}`}
        className="flex min-h-11 cursor-pointer list-none items-center gap-2 border-2 border-primary-foreground px-2 text-primary-foreground focus-visible:outline-primary-foreground"
      >
        <span className="flex size-9 items-center justify-center border-2 border-primary-foreground font-display text-lg" aria-hidden="true">
          {initial}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-bold sm:block">{viewer.displayName}</span>
      </summary>
      <div className="absolute right-0 mt-2 min-w-48 border-2 border-foreground bg-surface p-2 shadow-none">
        <Link
          href={`/users/${viewer.userId}`}
          className="block min-h-11 px-3 py-3 text-sm font-bold uppercase tracking-wide text-foreground hover:text-primary-text"
        >
          Meu perfil
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="min-h-11 w-full cursor-pointer px-3 text-left text-sm font-bold uppercase tracking-wide text-muted hover:text-danger"
        >
          Sair
        </button>
      </div>
    </details>
  );
}
