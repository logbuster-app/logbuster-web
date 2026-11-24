import Link from "next/link";
import { StateMessage } from "@/shared/components/StateMessage";

export default function UserProfileNotFound() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-16 text-center">
      <StateMessage
        title="Perfil não encontrado"
        description="A conta procurada não existe ou o endereço informado está incorreto."
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
