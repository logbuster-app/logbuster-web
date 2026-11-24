import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, saveSession } from "@/shared/lib/session";

const envMock = vi.hoisted(() => ({
  apiBaseUrl: "http://localhost:8000",
  useApiMocks: false,
}));
vi.mock("@/shared/config/env", () => ({ env: envMock }));

import {
  deleteProfileImage,
  fetchAvatars,
  fetchProfile,
  toPublicProfile,
  updateProfile,
  uploadProfileImage,
} from "./profile";
import { resetMockProfiles } from "./profile.mock";

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("profile api", () => {
  beforeEach(() => {
    envMock.useApiMocks = false;
    resetMockProfiles();
    clearSession();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearSession();
  });

  it("converte o payload snake_case para modelo de domínio com URLs absolutas e arquétipo", () => {
    const mapped = toPublicProfile({
      user_id: "u1",
      display_name: "Helena",
      created_at: "2026-11-01T12:00:00Z",
      bio: "Bio curta",
      avatar_id: "avatar-04",
      avatar_image_url: "/api/v1/users/u1/images/avatar/v1",
      background_image_url: "/api/v1/users/u1/images/background/v2",
      archetype: {
        title: "Crítico exigente",
        description: "Média de 2,1 estrelas.",
      },
    });

    expect(mapped).toEqual({
      userId: "u1",
      displayName: "Helena",
      createdAt: "2026-11-01T12:00:00Z",
      bio: "Bio curta",
      avatarId: "avatar-04",
      avatarImageUrl: "http://localhost:8000/api/v1/users/u1/images/avatar/v1",
      backgroundImageUrl: "http://localhost:8000/api/v1/users/u1/images/background/v2",
      archetype: {
        title: "Crítico exigente",
        description: "Média de 2,1 estrelas.",
      },
    });
  });

  it("retorna null para id vazio, 404 ou 422 e propaga outros erros em fetchProfile", async () => {
    expect(await fetchProfile("   ")).toBeNull();

    mockFetch({ error: { message: "Usuário não encontrado." } }, 404);
    expect(await fetchProfile("00000000-0000-0000-0000-000000000000")).toBeNull();

    mockFetch({ error: { message: "UUID inválido." } }, 422);
    expect(await fetchProfile("nao-uuid")).toBeNull();

    mockFetch({ error: { message: "Falha interna." } }, 500);
    await expect(fetchProfile("u1")).rejects.toMatchObject({ status: 500 });
  });

  it("consulta o catálogo de avatares e aplica fallback se vier vazio", async () => {
    mockFetch({ items: [{ id: "avatar-01" }, { id: "avatar-08" }, { id: "desconhecido" }] });
    expect(await fetchAvatars()).toEqual(["avatar-01", "avatar-08"]);

    mockFetch({ items: [] });
    expect(await fetchAvatars()).toHaveLength(8);
  });

  it("atualiza bio e avatar via PATCH /api/v1/users/me com Bearer automático", async () => {
    saveSession({
      accessToken: "jwt-123",
      expiresAt: Date.now() + 60_000,
      viewer: { userId: "u1", displayName: "Helena" },
    });

    const fetchMock = mockFetch({
      user_id: "u1",
      display_name: "Helena",
      created_at: "2026-11-01T12:00:00Z",
      bio: "Nova bio",
      avatar_id: "avatar-05",
      avatar_image_url: null,
      background_image_url: null,
      archetype: null,
    });

    const updated = await updateProfile({ bio: "Nova bio", avatarId: "avatar-05" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(new URL(url).pathname).toBe("/api/v1/users/me");
    expect(init.method).toBe("PATCH");
    expect(init.headers.Authorization).toBe("Bearer jwt-123");
    expect(JSON.parse(init.body)).toEqual({ bio: "Nova bio", avatar_id: "avatar-05" });
    expect(updated.bio).toBe("Nova bio");
    expect(updated.avatarId).toBe("avatar-05");
  });

  it("envia arquivo binário no PUT e aceita 204 no DELETE de imagens", async () => {
    const putMock = mockFetch({ url: "/api/v1/users/u1/images/avatar/v9" });
    const file = new File(["webp-bytes"], "avatar.webp", { type: "image/webp" });

    const resolvedUrl = await uploadProfileImage("avatar", file);
    expect(resolvedUrl).toBe("http://localhost:8000/api/v1/users/u1/images/avatar/v9");

    const [putUrl, putInit] = putMock.mock.calls[0];
    expect(new URL(putUrl).pathname).toBe("/api/v1/users/me/images/avatar");
    expect(putInit.method).toBe("PUT");
    expect(putInit.body).toBe(file);
    expect(putInit.headers["Content-Type"]).toBe("image/webp");

    const deleteMock = mockFetch(undefined, 204);
    await expect(deleteProfileImage("background")).resolves.toBeUndefined();
    const [delUrl, delInit] = deleteMock.mock.calls[0];
    expect(new URL(delUrl).pathname).toBe("/api/v1/users/me/images/background");
    expect(delInit.method).toBe("DELETE");
  });

  it("opera em modo mock quando env.useApiMocks é true", async () => {
    envMock.useApiMocks = true;
    saveSession({
      accessToken: "mock-jwt",
      expiresAt: Date.now() + 60_000,
      viewer: {
        userId: "11111111-1111-4111-8111-111111111111",
        displayName: "Helena Glauber",
      },
    });

    const initial = await fetchProfile("11111111-1111-4111-8111-111111111111");
    expect(initial?.displayName).toBe("Helena Glauber");
    expect(await fetchProfile("inexistente")).toBeNull();
    expect(await fetchAvatars()).toHaveLength(8);

    const updated = await updateProfile({ bio: "Bio mockada", avatarId: "avatar-07" });
    expect(updated.bio).toBe("Bio mockada");
    expect(updated.avatarId).toBe("avatar-07");

    const file = new File(["img"], "capa.png", { type: "image/png" });
    const uploadedUrl = await uploadProfileImage("background", file);
    expect(uploadedUrl).toBeTruthy();

    await deleteProfileImage("background");
    const afterDelete = await fetchProfile("11111111-1111-4111-8111-111111111111");
    expect(afterDelete?.backgroundImageUrl).toBeNull();
  });
});
