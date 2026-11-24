import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProfile } from "@/features/profile/server";
import { TimeMachineClient } from "./TimeMachineClient";

type TimeMachinePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TimeMachinePageProps): Promise<Metadata> {
  const { id } = await params;
  const trimmedId = id ? id.trim() : "";

  if (!trimmedId) {
    return { title: "Perfil não encontrado | LogBuster" };
  }

  try {
    const profile = await fetchProfile(trimmedId);
    if (!profile) {
      return { title: "Perfil não encontrado | LogBuster" };
    }

    return {
      title: `A jornada de ${profile.displayName} | LogBuster`,
      description: `Retrospectiva Máquina do Tempo das avaliações de ${profile.displayName} no LogBuster.`,
    };
  } catch {
    return { title: "Máquina do Tempo | LogBuster" };
  }
}

export default async function TimeMachinePage({ params }: TimeMachinePageProps) {
  const { id } = await params;
  const trimmedId = id ? id.trim() : "";

  if (!trimmedId) {
    notFound();
  }

  let profile = null;
  let fetchFailed = false;
  try {
    profile = await fetchProfile(trimmedId);
  } catch {
    fetchFailed = true;
  }

  if (!fetchFailed && profile === null) {
    notFound();
  }

  return (
    <div className="py-6 sm:py-8">
      <TimeMachineClient userId={trimmedId} initialProfile={profile} />
    </div>
  );
}
