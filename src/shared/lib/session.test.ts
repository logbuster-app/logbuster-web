import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSession,
  getAccessToken,
  readSession,
  saveSession,
  SESSION_STORAGE_KEY,
} from "./session";

describe("session", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearSession();
  });

  it("grava, lê e remove uma sessão válida", () => {
    saveSession({
      accessToken: "token-test",
      expiresAt: Date.now() + 3600000,
      viewer: { userId: "user-1", displayName: "Ana" },
    });

    expect(getAccessToken()).toBe("token-test");
    expect(readSession()?.viewer.displayName).toBe("Ana");

    clearSession();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("descarta automaticamente uma sessão vencida", () => {
    saveSession({
      accessToken: "token-expirado",
      expiresAt: Date.now() - 1000,
      viewer: { userId: "user-1", displayName: "Ana" },
    });

    expect(readSession()).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});
