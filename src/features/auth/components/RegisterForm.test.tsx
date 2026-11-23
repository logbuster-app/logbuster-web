import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider } from "@/shared/contexts/SessionContext";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams("next=/movies/tt0133093"),
}));

const registerMock = vi.hoisted(() => vi.fn());
const loginMock = vi.hoisted(() => vi.fn());
vi.mock("../api/auth", () => ({
  registerAccount: registerMock,
  loginAccount: loginMock,
}));

import { RegisterForm } from "./RegisterForm";

describe("RegisterForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("cadastra, autentica automaticamente e volta ao filme", async () => {
    registerMock.mockResolvedValueOnce({ userId: "user-1", displayName: "Ana" });
    loginMock.mockResolvedValueOnce({
      accessToken: "token-test",
      expiresIn: 3600,
      viewer: { userId: "user-1", displayName: "Ana" },
    });
    const user = userEvent.setup();

    render(
      <SessionProvider>
        <RegisterForm />
      </SessionProvider>,
    );

    await user.type(screen.getByLabelText(/nome de exibição/i), "Ana");
    await user.type(screen.getByLabelText(/e-mail/i), "ana@example.com");
    await user.type(screen.getByLabelText(/^senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(registerMock).toHaveBeenCalledWith({
      displayName: "Ana",
      email: "ana@example.com",
      password: "senha123",
    });
    expect(loginMock).toHaveBeenCalledWith({ email: "ana@example.com", password: "senha123" });
    expect(replace).toHaveBeenCalledWith("/movies/tt0133093");
  });

  it("exibe conflito de e-mail no formulário", async () => {
    registerMock.mockRejectedValueOnce(new Error("Este e-mail já está cadastrado"));
    const user = userEvent.setup();

    render(
      <SessionProvider>
        <RegisterForm />
      </SessionProvider>,
    );

    await user.type(screen.getByLabelText(/nome de exibição/i), "Ana");
    await user.type(screen.getByLabelText(/e-mail/i), "ana@example.com");
    await user.type(screen.getByLabelText(/^senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Este e-mail já está cadastrado");
  });
});
