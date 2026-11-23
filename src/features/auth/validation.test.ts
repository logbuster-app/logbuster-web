import { describe, expect, it } from "vitest";
import { validateLogin, validateRegister } from "./validation";

describe("auth validation", () => {
  it("valida cadastro e normaliza nome e e-mail", () => {
    expect(validateRegister({
      displayName: "  Ana Cinefila  ",
      email: " ANA@EXAMPLE.COM ",
      password: "senha123",
    })).toEqual({
      ok: true,
      input: {
        displayName: "Ana Cinefila",
        email: "ANA@EXAMPLE.COM",
        password: "senha123",
      },
    });
  });

  it("rejeita nome curto, e-mail inválido e senha curta", () => {
    expect(validateRegister({ displayName: "A", email: "ana", password: "123" }).ok).toBe(false);
  });

  it("valida login com e-mail válido e senha presente", () => {
    expect(validateLogin({ email: "ana@example.com", password: "senha123" }).ok).toBe(true);
    expect(validateLogin({ email: "inválido", password: "" }).ok).toBe(false);
  });
});
