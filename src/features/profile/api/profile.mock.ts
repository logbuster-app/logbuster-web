import { AVATAR_IDS, type AvatarId, type ProfileImageKind, type PublicProfile, type UpdateProfileInput } from "../types";

const INITIAL_MOCK_PROFILES: Record<string, PublicProfile> = {
  "11111111-1111-4111-8111-111111111111": {
    userId: "11111111-1111-4111-8111-111111111111",
    displayName: "Helena Glauber",
    createdAt: "2026-11-01T14:00:00Z",
    bio: "Crítica apaixonada pelo Cinema Novo, fotografia em película e debates longos depois da sessão.",
    avatarId: "avatar-01",
    avatarImageUrl: "/avatars/avatar-06.svg",
    backgroundImageUrl: "/avatars/avatar-08.svg",
    archetype: {
      title: "Voz da comunidade",
      description: "Suas análises recebem em média 6,3 votos de bem argumentada.",
    },
  },
  "22222222-2222-4222-8222-222222222222": {
    userId: "22222222-2222-4222-8222-222222222222",
    displayName: "Thyago",
    createdAt: "2026-11-08T10:00:00Z",
    bio: "Explorando clássicos de ficção científica.",
    avatarId: "avatar-02",
    avatarImageUrl: null,
    backgroundImageUrl: null,
    archetype: null,
  },
};

let mockProfiles: Record<string, PublicProfile> = JSON.parse(
  JSON.stringify(INITIAL_MOCK_PROFILES),
);

export function resetMockProfiles(): void {
  mockProfiles = JSON.parse(JSON.stringify(INITIAL_MOCK_PROFILES));
}

export async function fetchProfileMock(userId: string): Promise<PublicProfile | null> {
  const found = mockProfiles[userId];
  return found ? { ...found, archetype: found.archetype ? { ...found.archetype } : null } : null;
}

export async function fetchAvatarsMock(): Promise<AvatarId[]> {
  return [...AVATAR_IDS];
}

export async function updateProfileMock(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicProfile> {
  const existing =
    mockProfiles[userId] ??
    ({
      userId,
      displayName: "Cinéfilo",
      createdAt: "2026-11-20T12:00:00Z",
      bio: null,
      avatarId: null,
      avatarImageUrl: null,
      backgroundImageUrl: null,
      archetype: null,
    } satisfies PublicProfile);

  const updated: PublicProfile = {
    ...existing,
    ...(input.bio !== undefined ? { bio: input.bio } : {}),
    ...(input.avatarId !== undefined ? { avatarId: input.avatarId } : {}),
  };
  mockProfiles[userId] = updated;
  return { ...updated };
}

export async function uploadProfileImageMock(
  userId: string,
  kind: ProfileImageKind,
  file: File,
): Promise<string> {
  const url =
    typeof URL.createObjectURL === "function"
      ? URL.createObjectURL(file)
      : `https://mock.local/${userId}/${kind}/${encodeURIComponent(file.name)}`;

  const existing = mockProfiles[userId];
  if (existing) {
    mockProfiles[userId] = {
      ...existing,
      ...(kind === "avatar" ? { avatarImageUrl: url } : { backgroundImageUrl: url }),
    };
  }
  return url;
}

export async function deleteProfileImageMock(
  userId: string,
  kind: ProfileImageKind,
): Promise<void> {
  const existing = mockProfiles[userId];
  if (existing) {
    mockProfiles[userId] = {
      ...existing,
      ...(kind === "avatar" ? { avatarImageUrl: null } : { backgroundImageUrl: null }),
    };
  }
}
