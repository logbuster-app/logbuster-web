import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import UserProfilePage, { generateMetadata } from "./page";

const mockFetchProfile = vi.fn();
const mockNotFound = vi.fn();

vi.mock("@/features/profile/server", () => ({
  fetchProfile: (id: string) => mockFetchProfile(id),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("./UserProfileClient", () => ({
  UserProfileClient: ({ userId }: { userId: string }) => (
    <div data-testid="mock-user-profile-client" data-user-id={userId}>
      Perfil de {userId}
    </div>
  ),
}));

afterEach(() => {
  mockFetchProfile.mockReset();
  mockNotFound.mockReset();
});

describe("UserProfilePage (/users/[id])", () => {
  it("pré-carrega o perfil no servidor e renderiza UserProfileClient", async () => {
    mockFetchProfile.mockResolvedValueOnce({
      userId: "u1",
      displayName: "Helena Glauber",
      createdAt: "2026-11-01T14:00:00Z",
      bio: "Bio de Helena",
      avatarId: "avatar-01",
      avatarImageUrl: null,
      backgroundImageUrl: null,
      archetype: null,
    });

    const pageElement = await UserProfilePage({
      params: Promise.resolve({ id: "u1" }),
    });
    render(pageElement);

    expect(screen.getByTestId("mock-user-profile-client")).toHaveAttribute(
      "data-user-id",
      "u1",
    );
  });

  it("aciona notFound quando o perfil não existe", async () => {
    mockFetchProfile.mockResolvedValueOnce(null);

    await expect(
      UserProfilePage({ params: Promise.resolve({ id: "inexistente" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it("gera metadados com o nome e bio do perfil", async () => {
    mockFetchProfile.mockResolvedValueOnce({
      userId: "u1",
      displayName: "Helena Glauber",
      createdAt: "2026-11-01T14:00:00Z",
      bio: "Bio de Helena",
      avatarId: null,
      avatarImageUrl: null,
      backgroundImageUrl: null,
      archetype: null,
    });

    const meta = await generateMetadata({
      params: Promise.resolve({ id: "u1" }),
    });

    expect(meta.title).toBe("Helena Glauber | LogBuster");
    expect(meta.description).toBe("Bio de Helena");
  });
});
