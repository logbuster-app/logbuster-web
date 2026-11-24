// API pública da feature de perfil público e arquétipo (SPEC-FRONT-09).
export { ProfileView } from "./components/ProfileView";
export type { ProfileViewProps } from "./components/ProfileView";
export { ProfileHeader } from "./components/ProfileHeader";
export type { ProfileHeaderProps } from "./components/ProfileHeader";
export { ArchetypeBadge } from "./components/ArchetypeBadge";
export type { ArchetypeBadgeProps } from "./components/ArchetypeBadge";
export { Avatar } from "./components/Avatar";
export type { AvatarProps } from "./components/Avatar";
export { ProfileEditModal } from "./components/ProfileEditModal";
export type { ProfileEditModalProps } from "./components/ProfileEditModal";
export { AvatarPicker } from "./components/AvatarPicker";
export type { AvatarPickerProps } from "./components/AvatarPicker";
export { ImageField } from "./components/ImageField";
export type { ImageFieldProps } from "./components/ImageField";
export { usePublicProfile } from "./hooks/usePublicProfile";
export type { PublicProfileStatus } from "./hooks/usePublicProfile";
export {
  fetchProfile,
  fetchAvatars,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  toPublicProfile,
  resolveBackendAssetUrl,
} from "./api/profile";
export { resetMockProfiles } from "./api/profile.mock";
export {
  PROFILE_LIMITS,
  validateProfilePatch,
  validateProfileImage,
} from "./validation";
export type {
  AvatarId,
  ProfileImageKind,
  Archetype,
  PublicProfile,
  UpdateProfileInput,
  AvatarCatalogItem,
} from "./types";
export {
  AVATAR_IDS,
  AVATAR_CATALOG,
  isAvatarId,
  getAvatarCatalogItem,
} from "./types";
