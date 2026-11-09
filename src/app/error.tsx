"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StateMessage } from "@/shared/components/StateMessage";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro não tratado na aplicação:", error);
  }, [error]);

  return (
    <div className="py-20 space-y-6 max-w-lg mx-auto text-center">
      <StateMessage
        tone="danger"
        title="Ocorreu um erro inesperado"
        description={
          error.message ||
          "Algo deu errado ao carregar esta página. Tente recarregar."
        }
      />

      <div className="flex justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="h-10 rounded-card bg-primary px-5 text-sm font-semibold text-primary-contrast transition-opacity hover:opacity-90"
        >
          Tentar novamente
        </button>

        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-card border border-border bg-surface-raised px-5 text-sm font-semibold transition-colors hover:border-primary-text"
        >
          Página inicial
        </Link>
      </div>
    </div>
  );
}
