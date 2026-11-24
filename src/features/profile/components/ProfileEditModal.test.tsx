import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AVATAR_IDS, type PublicProfile } from "../types";
import { ProfileEditModal } from "./ProfileEditModal";

const mockFetchAvatars = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock("../api/profile", () => ({
  fetchAvatars: (...args: unknown[]) => mockFetchAvatars(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  uploadProfileImage: vi.fn(),
  deleteProfileImage: vi.fn(),
}));

const sampleProfile: PublicProfile = {
  userId: "u1",
  displayName: "Helena",
  createdAt: "2026-11-01T12:00:00Z",
  bio: "Bio inicial",
  avatarId: "avatar-01",
  avatarImageUrl: null,
  backgroundImageUrl: null,
  archetype: null,
};

afterEach(() => {
  mockFetchAvatars.mockReset();
  mockUpdateProfile.mockReset();
});

describe("ProfileEditModal", () => {
  it("edita bio e avatar, envia PATCH e fecha ao salvar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSaved = vi.fn();

    mockFetchAvatars.mockResolvedValueOnce([...AVATAR_IDS]);
    mockUpdateProfile.mockResolvedValueOnce({
      ...sampleProfile,
      bio: "Nova bio de cinéfila",
      avatarId: "avatar-03",
    });

    render(
      <ProfileEditModal
        profile={sampleProfile}
        onClose={onClose}
        onProfileRefresh={vi.fn()}
        onSaved={onSaved}
      />,
    );

    const textarea = screen.getByLabelText("Bio");
    await user.clear(textarea);
    await user.type(textarea, "Nova bio de cinéfila");

    await user.click(screen.getByRole("button", { name: "Avatar 3 — Projetor" }));
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        bio: "Nova bio de cinéfila",
        avatarId: "avatar-03",
      }),
    );
    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("exibe alerta e permanece aberto quando updateProfile falha", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    mockFetchAvatars.mockRejectedValueOnce(new Error("Sem rede"));
    mockUpdateProfile.mockRejectedValueOnce(new Error("Erro ao salvar perfil."));

    render(
      <ProfileEditModal
        profile={sampleProfile}
        onClose={onClose}
        onProfileRefresh={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Erro ao salvar perfil.");
    expect(onClose).not.toHaveBeenCalled();
  });
});
