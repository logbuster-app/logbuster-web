import Link from "next/link";
import { StateMessage } from "@/shared/components/StateMessage";

export default function MovieNotFound() {
  return (
    <div className="py-16 space-y-6 max-w-md mx-auto text-center">
      <StateMessage
        title="Filme não encontrado"
        description="Não encontramos o filme solicitado no catálogo do LogBuster."
      />

      <div>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-card bg-primary px-6 text-sm font-semibold text-primary-contrast transition-opacity hover:opacity-90"
        >
          Fazer uma nova busca
        </Link>
      </div>
    </div>
  );
}
