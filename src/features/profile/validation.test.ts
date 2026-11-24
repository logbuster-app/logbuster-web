import { describe, expect, it } from "vitest";
import type { AvatarId } from "./types";
import {
  PROFILE_LIMITS,
  validateProfileImage,
  validateProfilePatch,
} from "./validation";

describe("validateProfilePatch", () => {
  it("normaliza bio vazia para null e preserva avatar válido", () => {
    expect(
      validateProfilePatch({ bio: "   ", avatarId: "avatar-03" }),
    ).toEqual({
      ok: true,
      input: { bio: null, avatarId: "avatar-03" },
    });
  });

  it("aceita bio de até 160 caracteres e avatar nulo", () => {
    const bio = "Cinéfila apaixonada por montagem e fotografia.";
    expect(validateProfilePatch({ bio: `  ${bio}  `, avatarId: null })).toEqual({
      ok: true,
      input: { bio, avatarId: null },
    });
  });

  it("rejeita bio acima de 160 caracteres, caractere nulo ou avatar inválido", () => {
    expect(
      validateProfilePatch({ bio: "a".repeat(161), avatarId: "avatar-01" }),
    ).toEqual({
      ok: false,
      error: "A bio deve ter no máximo 160 caracteres.",
    });

    expect(
      validateProfilePatch({ bio: "abc\u0000def", avatarId: "avatar-01" }),
    ).toEqual({
      ok: false,
      error: "A bio contém caracteres inválidos.",
    });

    expect(
      validateProfilePatch({ bio: "ok", avatarId: "invalido" as AvatarId }),
    ).toEqual({
      ok: false,
      error: "Escolha um avatar válido do catálogo.",
    });
  });
});

describe("validateProfileImage", () => {
  it("aceita JPEG, PNG e WebP até 8 MiB", () => {
    const file = new File(["bytes"], "foto.webp", { type: "image/webp" });
    expect(validateProfileImage(file)).toEqual({ ok: true });
  });

  it("rejeita tipos inválidos, arquivos vazios e imagens acima de 8 MiB", () => {
    const gif = new File(["gif"], "anim.gif", { type: "image/gif" });
    expect(validateProfileImage(gif)).toEqual({
      ok: false,
      error: "Envie uma imagem nos formatos JPEG, PNG ou WebP.",
    });

    const empty = new File([], "vazio.png", { type: "image/png" });
    expect(validateProfileImage(empty)).toEqual({
      ok: false,
      error: "O arquivo selecionado está vazio.",
    });

    const tooLarge = new File(["x"], "grande.jpg", { type: "image/jpeg" });
    Object.defineProperty(tooLarge, "size", {
      value: PROFILE_LIMITS.imageMaxBytes + 1,
    });
    expect(validateProfileImage(tooLarge)).toEqual({
      ok: false,
      error: "A imagem deve ter no máximo 8 MiB.",
    });
  });
});
