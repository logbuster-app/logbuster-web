"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Spinner } from "@/shared/components/Spinner";
import { StateMessage } from "@/shared/components/StateMessage";
import { useSession } from "@/shared/contexts/SessionContext";
import { usePublicProfile } from "../hooks/usePublicProfile";
import type { PublicProfile } from "../types";
import { ProfileEditModal } from "./ProfileEditModal";
import { ProfileHeader } from "./ProfileHeader";

export type ProfileViewProps = {
  userId: string;
  initialProfile?: PublicProfile | null;
  children?: ReactNode;
};

export function ProfileView({
  userId,
  initialProfile,
  children,
}: ProfileViewProps) {
  const { viewer } = useSession();
  const { profile, status, error, reload, setProfileData } = usePublicProfile(
    userId,
    initialProfile,
  );
  const [isEditing, setIsEditing] = useState(false);

  const isOwner = Boolean(viewer && profile && viewer.userId === profile.userId);

  if (status === "loading" && !profile) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Carregando perfil" />
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="mx-auto max-w-md space-y-6 py-16 text-center">
        <StateMessage
          title="Perfil não encontrado"
          description="A conta procurada não existe ou o endereço está incorreto."
        />
        <div>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-card bg-primary px-6 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Voltar para a busca
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error" && !profile) {
    return (
      <div className="py-12">
        <StateMessage
          tone="danger"
          title="Erro ao carregar perfil"
          description={error ?? "Não foi possível carregar os dados do perfil."}
        />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        onEditClick={() => setIsEditing(true)}
      />

      {children}

      {isEditing && isOwner ? (
        <ProfileEditModal
          profile={profile}
          onClose={() => setIsEditing(false)}
          onProfileRefresh={reload}
          onSaved={(updated) => {
            setProfileData(updated);
            reload();
          }}
        />
      ) : null}
    </div>
  );
}
