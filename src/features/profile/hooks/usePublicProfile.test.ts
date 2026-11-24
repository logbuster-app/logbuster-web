import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PublicProfile } from "../types";
import { usePublicProfile } from "./usePublicProfile";

const mockFetchProfile = vi.fn();

vi.mock("../api/profile", () => ({
  fetchProfile: (userId: string, signal?: AbortSignal) => mockFetchProfile(userId, signal),
}));

const sampleProfile: PublicProfile = {
  userId: "u1",
  displayName: "Helena",
  createdAt: "2026-11-01T12:00:00Z",
  bio: "Bio original",
  avatarId: "avatar-01",
  avatarImageUrl: null,
  backgroundImageUrl: null,
  archetype: null,
};

afterEach(() => {
  mockFetchProfile.mockReset();
});

describe("usePublicProfile", () => {
  it("usa initialProfile sem disparar requisição inicial e recarrega quando solicitado", async () => {
    mockFetchProfile.mockResolvedValueOnce({
      ...sampleProfile,
      bio: "Bio recarregada",
    });

    const { result } = renderHook(() => usePublicProfile("u1", sampleProfile));
    expect(result.current.status).toBe("success");
    expect(result.current.profile?.bio).toBe("Bio original");
    expect(mockFetchProfile).not.toHaveBeenCalled();

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.profile?.bio).toBe("Bio recarregada"));
    expect(mockFetchProfile).toHaveBeenCalledTimes(1);
  });

  it("trata perfil não encontrado e erro de carregamento", async () => {
    mockFetchProfile.mockResolvedValueOnce(null);
    const { result: nf } = renderHook(() => usePublicProfile("inexistente"));
    await waitFor(() => expect(nf.current.status).toBe("not_found"));

    mockFetchProfile.mockRejectedValueOnce(new Error("Falha de conexão"));
    const { result: err } = renderHook(() => usePublicProfile("u-erro"));
    await waitFor(() => expect(err.current.status).toBe("error"));
    expect(err.current.error).toBe("Falha de conexão");
  });
});
