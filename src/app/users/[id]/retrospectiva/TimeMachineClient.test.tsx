import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimeMachineClient } from "./TimeMachineClient";

const mockUsePublicProfile = vi.fn();
const mockUseUserReviewsAll = vi.fn();

vi.mock("@/features/profile", () => ({
  usePublicProfile: (...args: unknown[]) => mockUsePublicProfile(...args),
}));

vi.mock("@/features/movies", () => ({
  MovieTitleLink: ({ movieId }: { movieId: string }) => (
    <a href={`/movies/${movieId}`}>Filme {movieId}</a>
  ),
}));

vi.mock("@/features/reviews", async () => {
  const actual = await vi.importActual<typeof import("@/features/reviews")>(
    "@/features/reviews",
  );
  return {
    ...actual,
    useUserReviewsAll: (...args: unknown[]) => mockUseUserReviewsAll(...args),
  };
});

afterEach(() => {
  mockUsePublicProfile.mockReset();
  mockUseUserReviewsAll.mockReset();
});

describe("TimeMachineClient", () => {
  it("exibe 'Não foi possível montar a retrospectiva.' com link de volta ao perfil em caso de falha", () => {
    mockUsePublicProfile.mockReturnValue({
      profile: {
        userId: "u1",
        displayName: "Helena",
        createdAt: "2026-11-01T12:00:00Z",
        bio: null,
        avatarId: null,
        avatarImageUrl: null,
        backgroundImageUrl: null,
        archetype: null,
      },
      status: "success",
      error: null,
    });
    mockUseUserReviewsAll.mockReturnValue({
      reviews: [],
      total: 0,
      status: "error",
      error: "Serviço indisponível.",
    });

    render(<TimeMachineClient userId="u1" />);

    expect(
      screen.getByText("Não foi possível montar a retrospectiva."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar ao perfil/i })).toHaveAttribute(
      "href",
      "/users/u1",
    );
  });

  it("monta os cartazes quando perfil e avaliações carregam com sucesso", () => {
    mockUsePublicProfile.mockReturnValue({
      profile: {
        userId: "u1",
        displayName: "Helena",
        createdAt: "2026-11-01T12:00:00Z",
        bio: null,
        avatarId: null,
        avatarImageUrl: null,
        backgroundImageUrl: null,
        archetype: { title: "Equilibrado", description: "Média equilibrada." },
      },
      status: "success",
      error: null,
    });
    mockUseUserReviewsAll.mockReturnValue({
      reviews: [
        {
          id: "1",
          movieId: "tt0000001",
          authorName: "Helena",
          rating: 4.0,
          content: "a",
          isSpoiler: false,
          highlights: ["acting"],
          counts: { like: 0, spoiler: 0, wellArgued: 0 },
          viewerInteractions: [],
          createdAt: "2026-11-20T12:00:00Z",
        },
        {
          id: "2",
          movieId: "tt0000002",
          authorName: "Helena",
          rating: 4.5,
          content: "b",
          isSpoiler: false,
          highlights: ["acting"],
          counts: { like: 0, spoiler: 0, wellArgued: 0 },
          viewerInteractions: [],
          createdAt: "2026-11-19T12:00:00Z",
        },
        {
          id: "3",
          movieId: "tt0000003",
          authorName: "Helena",
          rating: 5.0,
          content: "c",
          isSpoiler: false,
          highlights: ["direction"],
          counts: { like: 0, spoiler: 0, wellArgued: 0 },
          viewerInteractions: [],
          createdAt: "2026-11-18T12:00:00Z",
        },
      ],
      total: 3,
      status: "success",
      error: null,
    });

    render(<TimeMachineClient userId="u1" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "A jornada de Helena" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 de 5")).toBeInTheDocument();
  });
});
