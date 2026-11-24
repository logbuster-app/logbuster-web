import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MovieTitleLink } from "./MovieTitleLink";

const mockGetMovieById = vi.fn();

vi.mock("../api/moviesClient", () => ({
  getMovieById: (id: string, signal?: AbortSignal) => mockGetMovieById(id, signal),
}));

afterEach(() => {
  mockGetMovieById.mockReset();
});

describe("MovieTitleLink", () => {
  it("exibe o título do filme e aponta para /movies/{id}", async () => {
    mockGetMovieById.mockResolvedValueOnce({
      id: "tt0133093",
      title: "The Matrix",
      year: "1999",
      runtime: "136 min",
      genres: ["Action"],
      director: null,
      actors: null,
      plot: null,
      posterUrl: null,
      ratingAvg: 4.5,
      ratingCount: 3,
    });

    render(<MovieTitleLink movieId="tt0133093" />);

    const link = await screen.findByRole("link", { name: "The Matrix" });
    expect(link).toHaveAttribute("href", "/movies/tt0133093");
  });

  it("faz fallback silencioso para o movieId quando o filme não é encontrado ou falha", async () => {
    mockGetMovieById.mockRejectedValueOnce(new Error("Serviço indisponível"));

    render(<MovieTitleLink movieId="tt9999999" className="custom-link" />);

    const link = await screen.findByRole("link", { name: "tt9999999" });
    expect(link).toHaveAttribute("href", "/movies/tt9999999");
    expect(link).toHaveClass("custom-link");
  });
});
