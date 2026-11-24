"use client";

import Link from "next/link";
import { MovieTitleLink } from "@/features/movies";
import { usePublicProfile, type PublicProfile } from "@/features/profile";
import { TimeMachine, useUserReviewsAll } from "@/features/reviews";
import { Spinner } from "@/shared/components/Spinner";
import { StateMessage } from "@/shared/components/StateMessage";

export type TimeMachineClientProps = {
  userId: string;
  initialProfile?: PublicProfile | null;
};

export function TimeMachineClient({
  userId,
  initialProfile,
}: TimeMachineClientProps) {
  const profileHref = `/users/${encodeURIComponent(userId)}`;
  const {
    profile,
    status: profileStatus,
    error: profileError,
  } = usePublicProfile(userId, initialProfile);
  const {
    reviews,
    status: reviewsStatus,
    error: reviewsError,
  } = useUserReviewsAll(userId);

  if (profileStatus === "not_found") {
    return (
      <div className="mx-auto max-w-md space-y-6 py-16 text-center">
        <StateMessage
          title="Perfil não encontrado"
          description="A conta procurada não existe ou o endereço informado está incorreto."
        />
        <div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-card bg-primary px-6 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-primary-foreground"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  if (profileStatus === "error" || reviewsStatus === "error") {
    return (
      <div className="mx-auto max-w-xl space-y-6 py-12 text-center">
        <StateMessage
          tone="danger"
          title="Não foi possível montar a retrospectiva."
          description={
            profileError ??
            reviewsError ??
            "Ocorreu um problema ao carregar os dados públicos desta conta."
          }
        />
        <div>
          <Link
            href={profileHref}
            className="inline-flex min-h-11 items-center justify-center rounded-card border-2 border-foreground px-6 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Voltar ao perfil
          </Link>
        </div>
      </div>
    );
  }

  if (profileStatus === "loading" || reviewsStatus === "loading" || !profile) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Montando a Máquina do Tempo" />
      </div>
    );
  }

  return (
    <TimeMachine
      displayName={profile.displayName}
      archetype={profile.archetype}
      reviews={reviews}
      profileHref={profileHref}
      renderMovie={(movieId, className) => (
        <MovieTitleLink movieId={movieId} className={className} />
      )}
    />
  );
}
