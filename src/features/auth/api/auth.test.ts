import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/config/env", () => ({
  env: { apiBaseUrl: "http://localhost:8000", useApiMocks: false },
}));

import { loginAccount, registerAccount } from "./auth";

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("auth api", () => {
  it("cadastra a conta no payload snake_case sem herdar autenticação", async () => {
    const fetchMock = mockFetch({
      user_id: "user-1",
      display_name: "Ana",
      created_at: "2026-11-23T12:00:00Z",
    }, 201);

    await registerAccount({ displayName: "Ana", email: "ana@example.com", password: "senha123" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(new URL(url).pathname).toBe("/api/v1/auth/register");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({
      display_name: "Ana",
      email: "ana@example.com",
      password: "senha123",
    });
  });

  it("faz login sem Bearer anterior e busca /auth/me com o novo token", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "token-novo", expires_in: 3600, token_type: "bearer" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          user_id: "user-1",
          display_name: "Ana",
          email: "ana@example.com",
          created_at: "2026-11-23T12:00:00Z",
          bio: null,
          avatar_id: null,
          avatar_image_url: null,
          background_image_url: null,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const session = await loginAccount({ email: "ana@example.com", password: "senha123" });

    expect(session).toEqual({
      accessToken: "token-novo",
      expiresIn: 3600,
      viewer: { userId: "user-1", displayName: "Ana" },
    });

    const [loginUrl, loginInit] = fetchMock.mock.calls[0];
    expect(new URL(loginUrl).pathname).toBe("/api/v1/auth/login");
    expect(loginInit.headers.Authorization).toBeUndefined();

    const [meUrl, meInit] = fetchMock.mock.calls[1];
    expect(new URL(meUrl).pathname).toBe("/api/v1/auth/me");
    expect(meInit.headers.Authorization).toBe("Bearer token-novo");
  });
});
