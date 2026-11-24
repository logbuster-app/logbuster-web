import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Review } from "../types";
import { UserReviewHistory } from "./UserReviewHistory";

const mockUseUserReviews = vi.fn();

vi.mock("../hooks/useUserReviews", () => ({
  useUserReviews: (userId: string) => mockUseUserReviews(userId),
}));

const baseReview: Review = {
  id: "r1",
  movieId: "tt0133093",
  authorName: "Helena",
  rating: 4.5,
  content: "Análise sem spoilers sobre o filme.",
  isSpoiler: false,
  highlights: ["direction"],
  counts: { like: 3, spoiler: 0, wellArgued: 5 },
  viewerInteractions: [],
  createdAt: "2026-11-20T18:00:00Z",
};

afterEach(() => {
  mockUseUserReviews.mockReset();
});

describe("UserReviewHistory", () => {
  it("renderiza as avaliações com o filme via renderMovie e oculta spoilers mantendo título e nota visíveis", async () => {
    const user = userEvent.setup();
    const loadMore = vi.fn();
    const onTotalLoaded = vi.fn();

    mockUseUserReviews.mockReturnValue({
      reviews: [
        baseReview,
        {
          ...baseReview,
          id: "r2",
          movieId: "tt0317248",
          rating: 5.0,
          content: "Segredo do final revelado pela autora.",
          isSpoiler: true,
        },
        {
          ...baseReview,
          id: "r3",
          movieId: "tt2762506",
          rating: 3.5,
          content: "Segredo ocultado por 10 votos da comunidade.",
          isSpoiler: false,
          counts: { like: 1, spoiler: 10, wellArgued: 2 },
        },
      ],
      total: 5,
      status: "success",
      errorMessage: null,
      hasMore: true,
      loadingMore: false,
      moreError: null,
      votingError: null,
      interactingReviewId: null,
      loadMore,
      toggleVote: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <UserReviewHistory
        userId="user-1"
        onTotalLoaded={onTotalLoaded}
        renderMovie={(movieId) => <a href={`/movies/${movieId}`}>Filme {movieId}</a>}
      />,
    );

    expect(onTotalLoaded).toHaveBeenCalledWith(5);
    expect(screen.getByRole("link", { name: "Filme tt0133093" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Filme tt0317248" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Filme tt2762506" })).toBeInTheDocument();

    // Títulos e notas visíveis, mas textos de spoiler ocultos com "Mostrar análise"
    expect(screen.getByText(/5,0/)).toBeInTheDocument();
    expect(screen.getByText(/3,5/)).toBeInTheDocument();
    expect(screen.queryByText("Segredo do final revelado pela autora.")).not.toBeInTheDocument();
    expect(screen.queryByText("Segredo ocultado por 10 votos da comunidade.")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /mostrar análise/i })).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /carregar mais/i }));
    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it("exibe estado vazio quando não há avaliações e estado de erro em falha", () => {
    mockUseUserReviews.mockReturnValueOnce({
      reviews: [],
      total: 0,
      status: "empty",
      errorMessage: null,
      hasMore: false,
      loadingMore: false,
      moreError: null,
      votingError: null,
      interactingReviewId: null,
      loadMore: vi.fn(),
      toggleVote: vi.fn(),
      reload: vi.fn(),
    });

    const { rerender } = render(<UserReviewHistory userId="user-empty" />);
    expect(screen.getByText("Nenhuma avaliação publicada")).toBeInTheDocument();

    mockUseUserReviews.mockReturnValueOnce({
      reviews: [],
      total: 0,
      status: "error",
      errorMessage: "Servidor indisponível.",
      hasMore: false,
      loadingMore: false,
      moreError: null,
      votingError: null,
      interactingReviewId: null,
      loadMore: vi.fn(),
      toggleVote: vi.fn(),
      reload: vi.fn(),
    });

    rerender(<UserReviewHistory userId="user-err" />);
    expect(screen.getByText("Erro ao carregar histórico")).toBeInTheDocument();
    expect(screen.getByText("Servidor indisponível.")).toBeInTheDocument();
  });
});
