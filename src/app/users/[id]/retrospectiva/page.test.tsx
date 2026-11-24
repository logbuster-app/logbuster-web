import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TimeMachinePage, { generateMetadata } from "./page";

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

vi.mock("./TimeMachineClient", () => ({
  TimeMachineClient: ({ userId }: { userId: string }) => (
    <div data-testid="mock-time-machine-client" data-user-id={userId}>
      Jornada de {userId}
    </div>
  ),
}));

afterEach(() => {
  mockFetchProfile.mockReset();
  mockNotFound.mockReset();
});

describe("TimeMachinePage (/users/[id]/retrospectiva)", () => {
  it("pré-carrega o perfil no servidor e renderiza TimeMachineClient", async () => {
    mockFetchProfile.mockResolvedValueOnce({
      userId: "u1",
      displayName: "Helena Glauber",
      createdAt: "2026-11-01T14:00:00Z",
      bio: null,
      avatarId: null,
      avatarImageUrl: null,
      backgroundImageUrl: null,
      archetype: null,
    });

    const page = await TimeMachinePage({ params: Promise.resolve({ id: "u1" }) });
    render(page);

    expect(screen.getByTestId("mock-time-machine-client")).toHaveAttribute(
      "data-user-id",
      "u1",
    );
  });

  it("chama notFound quando o perfil não existe e gera título 'A jornada de nome'", async () => {
    mockFetchProfile.mockResolvedValueOnce(null);
    await expect(
      TimeMachinePage({ params: Promise.resolve({ id: "inexistente" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    mockFetchProfile.mockResolvedValueOnce({
      userId: "u1",
      displayName: "Helena Glauber",
      createdAt: "2026-11-01T14:00:00Z",
      bio: null,
      avatarId: null,
      avatarImageUrl: null,
      backgroundImageUrl: null,
      archetype: null,
    });
    const meta = await generateMetadata({ params: Promise.resolve({ id: "u1" }) });
    expect(meta.title).toBe("A jornada de Helena Glauber | LogBuster");
  });
});
