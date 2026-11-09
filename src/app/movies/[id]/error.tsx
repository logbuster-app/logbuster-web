"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StateMessage } from "@/shared/components/StateMessage";

export default function MovieDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento em produção
    console.error("Erro na página do filme:", error);
  }, [error]);

  return (
    <div className="py-12 space-y-6 max-w-xl mx-auto text-center">
      <StateMessage
        tone="danger"
        title="Não foi possível carregar as informações do filme"
        description={
          error.message ||
          "Ocorreu uma falha inesperada na comunicação com o catálogo de filmes."
        }
      />

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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
          Voltar para a busca
        </Link>
      </div>
    </div>
  );
}
