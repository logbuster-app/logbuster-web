import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("prioriza a foto enviada sobre o avatar do catálogo e a inicial", () => {
    render(
      <Avatar
        displayName="Helena"
        avatarImageUrl="http://localhost:8000/api/v1/users/u1/images/avatar/v1"
        avatarId="avatar-01"
      />,
    );

    const img = screen.getByRole("img", { name: "Foto de Helena" });
    expect(img).toBeInTheDocument();
  });

  it("faz fallback da foto com erro para o avatar do catálogo e depois para a inicial", () => {
    render(
      <Avatar
        displayName="Helena"
        avatarImageUrl="http://localhost:8000/quebrada.webp"
        avatarId="avatar-01"
      />,
    );

    const photo = screen.getByRole("img", { name: "Foto de Helena" });
    fireEvent.error(photo);

    const catalogImg = screen.getByRole("img", { name: "Avatar 1 — Claquete" });
    expect(catalogImg).toBeInTheDocument();

    fireEvent.error(catalogImg);
    expect(screen.getByText("H")).toBeInTheDocument();
  });

  it("exibe a inicial quando não há foto nem ilustração escolhida", () => {
    render(
      <Avatar
        displayName="  ana  "
        avatarImageUrl={null}
        avatarId={null}
      />,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
