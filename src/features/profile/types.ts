export const AVATAR_IDS = [
  "avatar-01",
  "avatar-02",
  "avatar-03",
  "avatar-04",
  "avatar-05",
  "avatar-06",
  "avatar-07",
  "avatar-08",
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export type ProfileImageKind = "avatar" | "background";

export type Archetype = {
  title: string;
  description: string;
};

export type PublicProfile = {
  userId: string;
  displayName: string;
  createdAt: string;
  bio: string | null;
  avatarId: AvatarId | null;
  avatarImageUrl: string | null;
  backgroundImageUrl: string | null;
  archetype: Archetype | null;
};

export type UpdateProfileInput = {
  bio?: string | null;
  avatarId?: AvatarId | null;
};

export type AvatarCatalogItem = {
  id: AvatarId;
  label: string;
  src: string;
};

export const AVATAR_CATALOG: readonly AvatarCatalogItem[] = [
  { id: "avatar-01", label: "Avatar 1 — Claquete", src: "/avatars/avatar-01.svg" },
  { id: "avatar-02", label: "Avatar 2 — Película", src: "/avatars/avatar-02.svg" },
  { id: "avatar-03", label: "Avatar 3 — Projetor", src: "/avatars/avatar-03.svg" },
  { id: "avatar-04", label: "Avatar 4 — Câmera", src: "/avatars/avatar-04.svg" },
  { id: "avatar-05", label: "Avatar 5 — Ingresso", src: "/avatars/avatar-05.svg" },
  { id: "avatar-06", label: "Avatar 6 — Estrela de cartaz", src: "/avatars/avatar-06.svg" },
  { id: "avatar-07", label: "Avatar 7 — Megafone", src: "/avatars/avatar-07.svg" },
  { id: "avatar-08", label: "Avatar 8 — Tela panorâmica", src: "/avatars/avatar-08.svg" },
];

export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === "string" && (AVATAR_IDS as readonly string[]).includes(value);
}

export function getAvatarCatalogItem(avatarId: AvatarId | null): AvatarCatalogItem | null {
  if (!avatarId) return null;
  return AVATAR_CATALOG.find((item) => item.id === avatarId) ?? null;
}
