import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MovieRatingProvider,
  useMovieRatingContext,
} from "@/shared/contexts/MovieRatingContext";
import * as reviewsApi from "../api/reviews";
import type { Review, ReviewListPage } from "../types";
import { ReviewList } from "./ReviewList";

describe("ReviewList", () => {
  beforeEach(() => {
    vi.spyOn(reviewsApi, "fetchMovieRating").mockResolvedValue({
      movieId: "tt0133093",
      averageRating: 4.5,
      reviewsCount: 1,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sampleReview: Review = {
    id: "r1",
    movieId: "tt0133093",
    authorName: "Thyago",
    rating: 4.5,
    content: "Texto da análise.",
    isSpoiler: false,
    highlights: ["direction"],
    counts: { like: 2, spoiler: 0, wellArgued: 5 },
    viewerInteractions: [],
    createdAt: "2026-11-08T18:30:00Z",
  };

  const samplePage: ReviewListPage = {
    items: [sampleReview],
    total: 1,
    page: 1,
    pageSize: 10,
    sort: "well_argued",
  };

  it("renderiza indicador de carregamento", () => {
    vi.spyOn(reviewsApi, "fetchMovieReviews").mockImplementation(
      () => new Promise(() => {}),
    );

    render(<ReviewList movieId="tt0133093" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/carregando avaliações/i)).toBeInTheDocument();
  });

  it("renderiza estado vazio quando não há avaliações", async () => {
    vi.spyOn(reviewsApi, "fetchMovieReviews").mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      sort: "well_argued",
    });

    render(<ReviewList movieId="tt0000000" />);

    expect(await screen.findByText("Nenhuma avaliação ainda")).toBeInTheDocument();
    expect(
      screen.getByText("Seja o primeiro a avaliar este filme!"),
    ).toBeInTheDocument();
  });

  it("renderiza mensagem de erro quando a API falha", async () => {
    vi.spyOn(reviewsApi, "fetchMovieReviews").mockRejectedValueOnce(
      new Error("Erro de banco de dados"),
    );

    render(<ReviewList movieId="tt0133093" />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Erro ao carregar avaliações")).toBeInTheDocument();
    expect(screen.getByText("Erro de banco de dados")).toBeInTheDocument();
  });

  it("renderiza a lista de avaliações e permite mudar a ordenação", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(reviewsApi, "fetchMovieReviews")
      .mockResolvedValueOnce(samplePage)
      .mockResolvedValueOnce({
        ...samplePage,
        sort: "most_liked",
      });

    render(<ReviewList movieId="tt0133093" />);

    expect(await screen.findByText("Thyago")).toBeInTheDocument();
    expect(screen.getByText("Texto da análise.")).toBeInTheDocument();

    const select = screen.getByLabelText("Ordenar por:");
    expect(select).toHaveValue("well_argued");

    await user.selectOptions(select, "most_liked");

    expect(fetchSpy).toHaveBeenLastCalledWith(
      "tt0133093",
      expect.objectContaining({ sort: "most_liked" }),
      expect.any(AbortSignal),
    );
  });

  it("abre o modal e exibe a avaliação criada e a média atualizada", async () => {
    const user = userEvent.setup();
    const createdReview: Review = {
      ...sampleReview,
      id: "r2",
      authorName: "Ana",
      rating: 5,
      content: "Uma análise nova e suficientemente longa.",
    };
    vi.spyOn(reviewsApi, "fetchMovieReviews").mockResolvedValueOnce(samplePage);
    vi.spyOn(reviewsApi, "createReview").mockResolvedValueOnce(createdReview);
    const ratingSpy = vi
      .spyOn(reviewsApi, "fetchMovieRating")
      .mockResolvedValueOnce({ movieId: "tt0133093", averageRating: 4.5, reviewsCount: 1 })
      .mockResolvedValueOnce({ movieId: "tt0133093", averageRating: 4.75, reviewsCount: 2 });

    function RatingProbe() {
      const rating = useMovieRatingContext()?.rating;
      return (
        <p data-testid="rating-probe">
          {rating ? `${rating.averageRating}|${rating.reviewsCount}` : "-"}
        </p>
      );
    }

    render(
      <MovieRatingProvider>
        <RatingProbe />
        <ReviewList movieId="tt0133093" />
      </MovieRatingProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("rating-probe")).toHaveTextContent("4.5|1"));

    await user.click(await screen.findByRole("button", { name: "Avaliar filme" }));
    await user.click(screen.getByRole("button", { name: "5,0 de 5 estrelas" }));
    await user.type(screen.getByLabelText(/nome \/ apelido/i), "Ana");
    await user.type(
      screen.getByLabelText(/sua análise/i),
      "Uma análise nova e suficientemente longa.",
    );
    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // A média é recarregada e publicada no contexto (exibida uma única vez, na ficha do filme).
    await waitFor(() => expect(screen.getByTestId("rating-probe")).toHaveTextContent("4.75|2"));
    expect(ratingSpy).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/nota média da comunidade/i)).not.toBeInTheDocument();
  });

  it("exibe aviso de erro quando ocorre falha ao votar", async () => {
    const user = userEvent.setup();
    vi.spyOn(reviewsApi, "fetchMovieReviews").mockResolvedValueOnce(samplePage);
    vi.spyOn(reviewsApi, "toggleReviewInteraction").mockRejectedValueOnce(
      new Error("Servidor indisponível"),
    );

    render(<ReviewList movieId="tt0133093" />);

    expect(await screen.findByText("Thyago")).toBeInTheDocument();

    const wellArguedBtn = screen.getByRole("button", { name: /bem argumentada/i });
    await user.click(wellArguedBtn);

    expect(await screen.findByRole("alert")).toHaveTextContent("Servidor indisponível");
  });
});
