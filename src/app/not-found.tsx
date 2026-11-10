import Link from "next/link";
import { StateMessage } from "@/shared/components/StateMessage";

export default function GlobalNotFound() {
  return (
    <div className="py-20 space-y-6 max-w-md mx-auto text-center">
      <StateMessage
        title="Página não encontrada (404)"
        description="A página que você está procurando não existe ou foi movida."
      />

      <div>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-card bg-primary px-6 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
