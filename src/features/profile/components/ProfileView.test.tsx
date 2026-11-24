import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearSession, saveSession } from "@/shared/lib/session";
import { SessionProvider } from "@/shared/contexts/SessionContext";
import type { PublicProfile } from "../types";
import { ProfileView } from "./ProfileView";

const mockFetchProfile = vi.fn();
const mockFetchAvatars = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock("../api/profile", () => ({
  fetchProfile: (...args: unknown[]) => mockFetchProfile(...args),
  fetchAvatars: (...args: unknown[]) => mockFetchAvatars(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  uploadProfileImage: vi.fn(),
  deleteProfileImage: vi.fn(),
}));

const sampleProfile: PublicProfile = {
  userId: "owner-1",
  displayName: "Helena",
  createdAt: "2026-11-01T12:00:00Z",
  bio: "Bio original",
  avatarId: "avatar-02",
  avatarImageUrl: null,
  backgroundImageUrl: null,
  archetype: {
    title: "Equilibrado",
    description: "Média de 3,5 estrelas.",
  },
};

afterEach(() => {
  clearSession();
  mockFetchProfile.mockReset();
  mockFetchAvatars.mockReset();
  mockUpdateProfile.mockReset();
});

describe("ProfileView", () => {
  it("mostra Editar perfil apenas para o dono da conta e atualiza os dados ao salvar", async () => {
    const user = userEvent.setup();

    // Visitante deslogado não vê Editar perfil
    const { unmount } = render(
      <SessionProvider>
        <ProfileView userId="owner-1" initialProfile={sampleProfile}>
          <div>Histórico slot</div>
        </ProfileView>
      </SessionProvider>,
    );

    expect(screen.getByText("Histórico slot")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar perfil/i })).not.toBeInTheDocument();
    unmount();

    // Dono autenticado vê Editar perfil e abre o modal
    saveSession({
      accessToken: "jwt-owner",
      expiresAt: Date.now() + 60_000,
      viewer: { userId: "owner-1", displayName: "Helena" },
    });
    mockFetchAvatars.mockResolvedValueOnce(["avatar-01", "avatar-02"]);
    mockUpdateProfile.mockResolvedValueOnce({
      ...sampleProfile,
      bio: "Bio atualizada pela dona",
    });
    mockFetchProfile.mockResolvedValueOnce({
      ...sampleProfile,
      bio: "Bio atualizada pela dona",
    });

    render(
      <SessionProvider>
        <ProfileView userId="owner-1" initialProfile={sampleProfile} />
      </SessionProvider>,
    );

    await user.click(screen.getByRole("button", { name: /editar perfil/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const bioField = screen.getByLabelText("Bio");
    await user.clear(bioField);
    await user.type(bioField, "Bio atualizada pela dona");
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

    expect(await screen.findByText("Bio atualizada pela dona")).toBeInTheDocument();
  });

  it("renderiza os estados de não encontrado e de erro quando não há perfil inicial", async () => {
    mockFetchProfile.mockResolvedValueOnce(null);

    const { unmount } = render(
      <SessionProvider>
        <ProfileView userId="inexistente" />
      </SessionProvider>,
    );

    expect(await screen.findByText("Perfil não encontrado")).toBeInTheDocument();
    unmount();

    mockFetchProfile.mockRejectedValueOnce(new Error("Servidor fora do ar."));
    render(
      <SessionProvider>
        <ProfileView userId="erro-1" />
      </SessionProvider>,
    );

    expect(await screen.findByText("Erro ao carregar perfil")).toBeInTheDocument();
    expect(screen.getByText("Servidor fora do ar.")).toBeInTheDocument();
  });
});
