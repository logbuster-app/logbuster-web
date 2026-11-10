import { afterEach, describe, expect, it, vi } from "vitest";

const getVisitorId = vi.hoisted(() => vi.fn(() => "visitor-123"));
vi.mock("@/shared/lib/visitor", () => ({ getVisitorId }));

import { backendApi } from "./clients";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("backendApi", () => {
  it("envia o visitante no navegador", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    await backendApi.request("/api/v1/movies");
    expect(fetchMock.mock.calls[0][1].headers["X-Visitor-Id"]).toBe("visitor-123");
  });

  it("não gera visitante durante a renderização no servidor", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", undefined);
    await backendApi.request("/api/v1/movies");
    expect(getVisitorId).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][1].headers["X-Visitor-Id"]).toBeUndefined();
  });
});
