import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PublicProfile } from "../types";
import { ProfileHeader } from "./ProfileHeader";

const baseProfile: PublicProfile = {
  userId: "u1",
  displayName: "Helena Glauber",
  createdAt: "2026-11-01T14:00:00Z",
  bio: "Crítica dedicada ao cinema latino-americano.",
  avatarId: "avatar-01",
  avatarImageUrl: null,
  backgroundImageUrl: "http://localhost:8000/api/v1/users/u1/images/background/v1",
  archetype: {
    title: "Cinéfilo de autor",
    description: "Destaca a direção em 60% das suas avaliações.",
  },
};

describe("ProfileHeader", () => {
  it("renderiza nome, data de entrada, bio e arquétipo para qualquer visitante sem exibir Editar perfil", () => {
    render(<ProfileHeader profile={baseProfile} isOwner={false} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Helena Glauber" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Entrou em novembro de 2026/i)).toBeInTheDocument();
    expect(
      screen.getByText("Crítica dedicada ao cinema latino-americano."),
    ).toBeInTheDocument();
    expect(screen.getByText("Cinéfilo de autor")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar perfil/i }),
    ).not.toBeInTheDocument();
  });

  it("exibe o botão Editar perfil apenas para o titular e aciona onEditClick", async () => {
    const user = userEvent.setup();
    const onEditClick = vi.fn();

    render(<ProfileHeader profile={baseProfile} isOwner onEditClick={onEditClick} />);

    const editButton = screen.getByRole("button", { name: /editar perfil/i });
    await user.click(editButton);
    expect(onEditClick).toHaveBeenCalledTimes(1);
  });

  it("exibe o botão Máquina do Tempo apenas a partir de 3 avaliações", () => {
    const { rerender } = render(<ProfileHeader profile={baseProfile} />);
    const link = screen.getByRole("link", { name: /máquina do tempo/i });
    expect(link).toHaveAttribute("href", "/users/u1/retrospectiva");

    rerender(
      <ProfileHeader
        profile={{ ...baseProfile, archetype: null }}
        showTimeMachine={false}
      />,
    );
    expect(
      screen.queryByRole("link", { name: /máquina do tempo/i }),
    ).not.toBeInTheDocument();
  });
});
