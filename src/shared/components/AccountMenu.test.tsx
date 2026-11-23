import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { SessionProvider } from "../contexts/SessionContext";
import { AccountMenu } from "./AccountMenu";

describe("AccountMenu", () => {
  beforeEach(() => window.localStorage.clear());

  it("mostra Entrar e Criar conta sem sessão", () => {
    render(
      <SessionProvider>
        <AccountMenu />
      </SessionProvider>,
    );

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/register");
  });

  it("mostra perfil e permite sair com sessão válida", async () => {
    window.localStorage.setItem("logbuster:session", JSON.stringify({
      accessToken: "token-test",
      expiresAt: Date.now() + 3600000,
      viewer: { userId: "user-1", displayName: "Ana" },
    }));

    render(
      <SessionProvider>
        <AccountMenu />
      </SessionProvider>,
    );

    expect(screen.getByRole("link", { name: "Meu perfil" })).toHaveAttribute("href", "/users/user-1");

    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Menu da conta de Ana"));
    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
  });
});
