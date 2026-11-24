"use client";

import Image from "next/image";
import { useState } from "react";
import { parseUtcDate } from "@/shared/lib/format";
import type { PublicProfile } from "../types";
import { ArchetypeBadge } from "./ArchetypeBadge";
import { Avatar } from "./Avatar";

export type ProfileHeaderProps = {
  profile: PublicProfile;
  isOwner?: boolean;
  onEditClick?: () => void;
};

function formatJoinDate(isoString: string): string {
  const date = parseUtcDate(isoString);
  if (!date) return "";
  const formatted = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `Entrou em ${formatted}`;
}

export function ProfileHeader({
  profile,
  isOwner = false,
  onEditClick,
}: ProfileHeaderProps) {
  const [failedBgUrl, setFailedBgUrl] = useState<string | null>(null);
  const showBackground = Boolean(
    profile.backgroundImageUrl && failedBgUrl !== profile.backgroundImageUrl,
  );
  const joinedLabel = formatJoinDate(profile.createdAt);

  return (
    <header className="space-y-5">
      {/* Banner 16:9: imagem enviada ou faixa chapada bg-brand-800 (SPEC-UI-01 §6.4) */}
      <div className="relative aspect-[16/9] max-h-56 w-full overflow-hidden rounded-card border-2 border-foreground bg-brand-800 sm:max-h-72">
        {showBackground && profile.backgroundImageUrl ? (
          <Image
            src={profile.backgroundImageUrl}
            alt=""
            fill
            unoptimized
            priority
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover"
            onError={() => setFailedBgUrl(profile.backgroundImageUrl)}
          />
        ) : null}
      </div>

      {/* Avatar sobreposto à base do banner + ações */}
      <div className="relative z-10 -mt-14 flex flex-wrap items-end justify-between gap-4 px-4 sm:-mt-20 sm:px-6">
        <Avatar
          displayName={profile.displayName}
          avatarImageUrl={profile.avatarImageUrl}
          avatarId={profile.avatarId}
        />

        {isOwner ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onEditClick}
              className="min-h-11 cursor-pointer rounded-card border-2 border-foreground bg-background px-5 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Editar perfil
            </button>
          </div>
        ) : null}
      </div>

      {/* Dados públicos: nome, data de entrada, bio e arquétipo */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="font-display text-4xl text-foreground sm:text-6xl">
            {profile.displayName}
          </h1>
          {joinedLabel ? (
            <p className="text-sm text-muted">
              <time dateTime={profile.createdAt}>{joinedLabel}</time>
            </p>
          ) : null}
        </div>

        {profile.bio ? (
          <p className="font-reading max-w-[68ch] whitespace-pre-line text-lg text-foreground">
            {profile.bio}
          </p>
        ) : null}

        <div>
          <ArchetypeBadge archetype={profile.archetype} />
        </div>
      </div>
    </header>
  );
}
