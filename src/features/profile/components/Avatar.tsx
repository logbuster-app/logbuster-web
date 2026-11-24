"use client";

import Image from "next/image";
import { useState } from "react";
import { getAvatarCatalogItem, type AvatarId } from "../types";

export type AvatarProps = {
  displayName: string;
  avatarImageUrl: string | null;
  avatarId: AvatarId | null;
  className?: string;
};

/**
 * Avatar quadrado do perfil seguindo a prioridade da RN-02:
 * foto enviada -> ilustração SVG do catálogo -> inicial do nome em `font-display`.
 */
export function Avatar({
  displayName,
  avatarImageUrl,
  avatarId,
  className = "size-24 sm:size-32",
}: AvatarProps) {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  const [failedCatalogSrc, setFailedCatalogSrc] = useState<string | null>(null);

  const catalogItem = getAvatarCatalogItem(avatarId);
  const showPhoto = Boolean(avatarImageUrl && failedPhotoUrl !== avatarImageUrl);
  const showCatalog =
    !showPhoto && Boolean(catalogItem && failedCatalogSrc !== catalogItem.src);
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-card border-2 border-foreground bg-surface-raised ${className}`}
    >
      {showPhoto && avatarImageUrl ? (
        <Image
          src={avatarImageUrl}
          alt={`Foto de ${displayName}`}
          fill
          unoptimized
          sizes="128px"
          className="object-cover"
          onError={() => setFailedPhotoUrl(avatarImageUrl)}
        />
      ) : showCatalog && catalogItem ? (
        <Image
          src={catalogItem.src}
          alt={catalogItem.label}
          fill
          unoptimized
          sizes="128px"
          className="object-cover"
          onError={() => setFailedCatalogSrc(catalogItem.src)}
        />
      ) : (
        <span
          aria-label={`Inicial de ${displayName}`}
          className="flex h-full w-full items-center justify-center font-display text-4xl text-foreground sm:text-5xl"
        >
          {initial}
        </span>
      )}
    </div>
  );
}
