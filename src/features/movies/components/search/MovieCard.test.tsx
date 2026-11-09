import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MovieSummary } from "../../types";
import { MovieCard } from "./MovieCard";

describe("MovieCard", () => {
  const movieWithPoster: MovieSummary = {
    id: "tt0133093",
    title: "The Matrix",
    year: "1999",
    posterUrl: "https://m.media-amazon.com/matrix.jpg",
  };

  const movieWithoutPoster: MovieSummary = {
    id: "tt0000001",
    title: "Filme Sem Imagem",
    year: "2024",
    posterUrl: null,
  };

  it("renderiza link para a rota do filme específico (/movies/[id])", () => {
    render(<MovieCard movie={movieWithPoster} />);

    const link = screen.getByRole("link", { name: /ver detalhes de the matrix/i });
    expect(link).toHaveAttribute("href", "/movies/tt0133093");
    expect(screen.getByText("The Matrix")).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getByAltText("Poster de The Matrix")).toBeInTheDocument();
  });

  it('exibe placeholder "Sem poster" quando o filme não possui imagem', () => {
    render(<MovieCard movie={movieWithoutPoster} />);

    expect(screen.getByText("Sem poster")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
