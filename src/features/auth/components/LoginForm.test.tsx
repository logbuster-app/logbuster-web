import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider } from "@/shared/contexts/SessionContext";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams("next=/movies/tt0133093"),
}));

const loginMock = vi.hoisted(() => vi.fn());
vi.mock("../api/auth", () => ({ loginAccount: loginMock }));

import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("entra e volta para a página de origem", async () => {
    loginMock.mockResolvedValueOnce({
      accessToken: "token-test",
      expiresIn: 3600,
      viewer: { userId: "user-1", displayName: "Ana" },
    });
    const user = userEvent.setup();

    render(
      <SessionProvider>
        <LoginForm />
      </SessionProvider>,
    );

    await user.type(screen.getByLabelText(/e-mail/i), "ana@example.com");
    await user.type(screen.getByLabelText(/^senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(loginMock).toHaveBeenCalledWith({ email: "ana@example.com", password: "senha123" });
    expect(replace).toHaveBeenCalledWith("/movies/tt0133093");
  });

  it("exibe erro do servidor sem derrubar a sessão", async () => {
    loginMock.mockRejectedValueOnce(new Error("Senha incorreta"));
    const user = userEvent.setup();

    render(
      <SessionProvider>
        <LoginForm />
      </SessionProvider>,
    );

    await user.type(screen.getByLabelText(/e-mail/i), "ana@example.com");
    await user.type(screen.getByLabelText(/^senha/i), "errada123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Senha incorreta");
  });
});
