import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VISITOR_STORAGE_KEY, getVisitorId } from "./visitor";

describe("getVisitorId", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gera e salva novo UUID v4 quando não há visitante no localStorage", () => {
    const id = getVisitorId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(window.localStorage.getItem(VISITOR_STORAGE_KEY)).toBe(id);
  });

  it("reutiliza o UUID salvo previamente no localStorage", () => {
    const existing = "550e8400-e29b-41d4-a716-446655440000";
    window.localStorage.setItem(VISITOR_STORAGE_KEY, existing);

    const id = getVisitorId();
    expect(id).toBe(existing);
  });

  it("trata erro ao acessar o localStorage com fallback seguro", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("QuotaExceeded or SecurityError");
    });

    const fallbackId = getVisitorId();
    expect(fallbackId).toBeDefined();
    expect(typeof fallbackId).toBe("string");
    expect(fallbackId.length).toBeGreaterThan(0);
  });

  it("usa fallback de geração de UUID quando crypto.randomUUID não existe", () => {
    const originalRandomUUID = crypto.randomUUID;
    // @ts-expect-error teste de fallback
    delete crypto.randomUUID;

    try {
      window.localStorage.clear();
      const id = getVisitorId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    } finally {
      crypto.randomUUID = originalRandomUUID;
    }
  });
});
