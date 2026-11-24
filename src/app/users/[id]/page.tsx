import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProfile } from "@/features/profile/server";
import { UserProfileClient } from "./UserProfileClient";

type UserProfilePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const trimmedId = id ? id.trim() : "";

  if (!trimmedId) {
    return { title: "Perfil não encontrado | LogBuster" };
  }

  try {
    const profile = await fetchProfile(trimmedId);
    if (!profile) {
      return {
        title: "Perfil não encontrado | LogBuster",
        description: "A conta solicitada não foi encontrada no LogBuster.",
      };
    }

    return {
      title: `${profile.displayName} | LogBuster`,
      description:
        profile.bio ??
        `Confira o perfil público, arquétipo de cinéfilo e análises publicadas por ${profile.displayName} no LogBuster.`,
    };
  } catch {
    return { title: "Perfil | LogBuster" };
  }
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
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
      <UserProfileClient userId={trimmedId} initialProfile={profile} />
    </div>
  );
}
