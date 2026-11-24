import { backendApi } from "@/shared/api/clients";
import { env } from "@/shared/config/env";
import { ApiError } from "@/shared/lib/errors";
import { readSession } from "@/shared/lib/session";
import {
  AVATAR_IDS,
  isAvatarId,
  type AvatarId,
  type ProfileImageKind,
  type PublicProfile,
  type UpdateProfileInput,
} from "../types";
import {
  deleteProfileImageMock,
  fetchAvatarsMock,
  fetchProfileMock,
  updateProfileMock,
  uploadProfileImageMock,
} from "./profile.mock";

export type BackendArchetype = {
  title: string;
  description: string;
};

export type BackendPublicProfile = {
  user_id: string;
  display_name: string;
  created_at: string;
  bio: string | null;
  avatar_id: string | null;
  avatar_image_url: string | null;
  background_image_url: string | null;
  archetype: BackendArchetype | null;
};

type BackendAvatarList = {
  items: { id: string }[];
};

type BackendProfileImageLink = {
  url: string;
};

export function resolveBackendAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed, env.apiBaseUrl).toString();
  } catch {
    return trimmed;
  }
}

export function toPublicProfile(raw: BackendPublicProfile): PublicProfile {
  return {
    userId: String(raw.user_id),
    displayName: raw.display_name,
    createdAt: raw.created_at,
    bio: raw.bio ?? null,
    avatarId: isAvatarId(raw.avatar_id) ? raw.avatar_id : null,
    avatarImageUrl: resolveBackendAssetUrl(raw.avatar_image_url),
    backgroundImageUrl: resolveBackendAssetUrl(raw.background_image_url),
    archetype:
      raw.archetype &&
      typeof raw.archetype.title === "string" &&
      typeof raw.archetype.description === "string"
        ? {
            title: raw.archetype.title,
            description: raw.archetype.description,
          }
        : null,
  };
}

/**
 * Consulta o perfil público (`GET /api/v1/users/{id}`).
 * Retorna `null` quando o perfil não existe (`404`) ou o identificador é inválido (`422`).
 */
export async function fetchProfile(
  userId: string,
  signal?: AbortSignal,
): Promise<PublicProfile | null> {
  const trimmedId = userId.trim();
  if (!trimmedId) return null;

  if (env.useApiMocks) {
    return fetchProfileMock(trimmedId);
  }

  try {
    const data = await backendApi.request<BackendPublicProfile>(
      `/api/v1/users/${encodeURIComponent(trimmedId)}`,
      {
        signal,
        networkMessage: "Não foi possível conectar ao servidor para carregar o perfil.",
        errorMessage: "Não foi possível carregar o perfil.",
      },
    );
    return toPublicProfile(data);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 422)) {
      return null;
    }
    throw err;
  }
}

export async function fetchAvatars(signal?: AbortSignal): Promise<AvatarId[]> {
  if (env.useApiMocks) {
    return fetchAvatarsMock();
  }

  const data = await backendApi.request<BackendAvatarList>("/api/v1/avatars", {
    signal,
    networkMessage: "Não foi possível carregar o catálogo de avatares.",
  });

  const ids = (data.items ?? []).map((item) => item.id).filter(isAvatarId);
  return ids.length > 0 ? ids : [...AVATAR_IDS];
}

export async function updateProfile(input: UpdateProfileInput): Promise<PublicProfile> {
  if (env.useApiMocks) {
    const viewerId = readSession()?.viewer.userId ?? "11111111-1111-4111-8111-111111111111";
    return updateProfileMock(viewerId, input);
  }

  const body: Record<string, unknown> = {};
  if ("bio" in input) body.bio = input.bio ?? null;
  if ("avatarId" in input) body.avatar_id = input.avatarId ?? null;

  const data = await backendApi.request<BackendPublicProfile>("/api/v1/users/me", {
    method: "PATCH",
    body,
    networkMessage: "Não foi possível salvar o perfil. Verifique sua conexão.",
  });

  return toPublicProfile(data);
}

export async function uploadProfileImage(
  kind: ProfileImageKind,
  file: File,
): Promise<string> {
  if (env.useApiMocks) {
    const viewerId = readSession()?.viewer.userId ?? "11111111-1111-4111-8111-111111111111";
    return uploadProfileImageMock(viewerId, kind, file);
  }

  const data = await backendApi.request<BackendProfileImageLink>(
    `/api/v1/users/me/images/${kind}`,
    {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
      networkMessage: "Não foi possível enviar a imagem. Verifique sua conexão.",
    },
  );

  return resolveBackendAssetUrl(data.url) ?? data.url;
}

export async function deleteProfileImage(kind: ProfileImageKind): Promise<void> {
  if (env.useApiMocks) {
    const viewerId = readSession()?.viewer.userId ?? "11111111-1111-4111-8111-111111111111";
    await deleteProfileImageMock(viewerId, kind);
    return;
  }

  await backendApi.request<void>(`/api/v1/users/me/images/${kind}`, {
    method: "DELETE",
    networkMessage: "Não foi possível remover a imagem. Verifique sua conexão.",
  });
}
