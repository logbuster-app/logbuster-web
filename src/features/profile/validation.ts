import { isAvatarId, type AvatarId, type UpdateProfileInput } from "./types";

export const PROFILE_LIMITS = {
  bioMaxLength: 160,
  imageMaxBytes: 8 * 1024 * 1024, // 8 MiB
  acceptedImageTypes: ["image/jpeg", "image/png", "image/webp"] as const,
};

export type ProfileValidationResult =
  | { ok: true; input: UpdateProfileInput }
  | { ok: false; error: string };

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateProfilePatch(values: {
  bio: string;
  avatarId: AvatarId | null;
}): ProfileValidationResult {
  if (values.bio.includes("\u0000")) {
    return { ok: false, error: "A bio contém caracteres inválidos." };
  }

  const trimmedBio = values.bio.trim();
  if (trimmedBio.length > PROFILE_LIMITS.bioMaxLength) {
    return {
      ok: false,
      error: `A bio deve ter no máximo ${PROFILE_LIMITS.bioMaxLength} caracteres.`,
    };
  }

  if (values.avatarId !== null && !isAvatarId(values.avatarId)) {
    return { ok: false, error: "Escolha um avatar válido do catálogo." };
  }

  return {
    ok: true,
    input: {
      bio: trimmedBio.length > 0 ? trimmedBio : null,
      avatarId: values.avatarId,
    },
  };
}

export function validateProfileImage(file: File): ImageValidationResult {
  const accepted: readonly string[] = PROFILE_LIMITS.acceptedImageTypes;
  if (!accepted.includes(file.type)) {
    return {
      ok: false,
      error: "Envie uma imagem nos formatos JPEG, PNG ou WebP.",
    };
  }

  if (file.size <= 0) {
    return {
      ok: false,
      error: "O arquivo selecionado está vazio.",
    };
  }

  if (file.size > PROFILE_LIMITS.imageMaxBytes) {
    return {
      ok: false,
      error: "A imagem deve ter no máximo 8 MiB.",
    };
  }

  return { ok: true };
}
