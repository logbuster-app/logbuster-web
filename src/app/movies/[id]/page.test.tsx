import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MoviePage, { generateMetadata } from "./page";

const mockGetMovieById = vi.fn();

// Mocks rasos para garantir teste isolado de composição
vi.mock("@/features/movies", () => ({
  MovieDetail: ({
    movieId,
    children,
  }: {
    movieId: string;
    children?: React.ReactNode;
  }) => (
    <div data-testid="mock-movie-detail" data-movie-id={movieId}>
      <h1>Movie Detail Mock: {movieId}</h1>
      {children}
    </div>
  ),
}));

vi.mock("@/features/movies/server", () => ({
  getMovieById: (id: string) => mockGetMovieById(id),
}));

vi.mock("@/features/reviews", () => ({
  ReviewList: ({ movieId }: { movieId: string }) => (
    <div data-testid="mock-review-list" data-movie-id={movieId}>
      Review List Mock: {movieId}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("MoviePage (/movies/[id])", () => {
  it("compõe MovieDetail e ReviewList passando o id da URL e pré-carrega o filme no servidor", async () => {
    mockGetMovieById.mockResolvedValueOnce({
      id: "tt0133093",
      title: "The Matrix",
      year: "1999",
      plot: "Um hacker descobre a verdade.",
      posterUrl: "https://poster.jpg",
    });

    const paramsPromise = Promise.resolve({ id: "tt0133093" });

    const pageElement = await MoviePage({ params: paramsPromise });
    render(pageElement);

    expect(await screen.findByTestId("mock-movie-detail")).toBeInTheDocument();
    expect(screen.getByTestId("mock-movie-detail")).toHaveAttribute(
      "data-movie-id",
      "tt0133093",
    );
    expect(
      screen.getByText("Movie Detail Mock: tt0133093"),
    ).toBeInTheDocument();

    expect(screen.getByTestId("mock-review-list")).toBeInTheDocument();
    expect(screen.getByTestId("mock-review-list")).toHaveAttribute(
      "data-movie-id",
      "tt0133093",
    );
    expect(
      screen.getByText("Review List Mock: tt0133093"),
    ).toBeInTheDocument();
  });

  it("gera metadados dinâmicos com título e ano para SEO", async () => {
    mockGetMovieById.mockResolvedValueOnce({
      id: "tt0133093",
      title: "The Matrix",
      year: "1999",
      plot: "Sinopse do Matrix",
      posterUrl: "https://poster.jpg",
    });

    const meta = await generateMetadata({
      params: Promise.resolve({ id: "tt0133093" }),
    });

    expect(meta.title).toBe("The Matrix (1999) | LogBuster");
    expect(meta.description).toBe("Sinopse do Matrix");
  });
});
