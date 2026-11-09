import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MovieSummary } from "../../types";
import { MovieGrid } from "./MovieGrid";

const movies: MovieSummary[] = [
  { id: "tt1", title: "Com Poster", year: "1999", posterUrl: "https://m.media-amazon.com/a.jpg" },
  { id: "tt2", title: "Sem Imagem", year: "2001", posterUrl: null },
];

describe("MovieGrid", () => {
  it("renderiza título e ano de cada filme", () => {
    render(<MovieGrid movies={movies} />);
    expect(screen.getByText("Com Poster")).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getByText("Sem Imagem")).toBeInTheDocument();
  });

  it("mostra o poster quando existe e um aviso quando não existe", () => {
    render(<MovieGrid movies={movies} />);
    expect(screen.getByAltText("Poster de Com Poster")).toBeInTheDocument();
    expect(screen.getByText("Sem poster")).toBeInTheDocument();
  });
});
