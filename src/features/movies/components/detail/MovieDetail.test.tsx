import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as omdbApi from "../../api/moviesClient";
import type { MovieDetail as MovieDetailType } from "../../types";
import { MovieDetail } from "./MovieDetail";

describe("MovieDetail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const fullMovie: MovieDetailType = {
    id: "tt0133093",
    title: "The Matrix",
    year: "1999",
    runtime: "136 min",
    genres: ["Action", "Sci-Fi"],
    director: "Lana Wachowski, Lilly Wachowski",
    actors: "Keanu Reeves, Laurence Fishburne",
    plot: "Um hacker descobre a chocante verdade sobre sua realidade.",
    posterUrl: "https://m.media-amazon.com/matrix.jpg",
    ratingAvg: null,
    ratingCount: 0,
  };

  it("renderiza o estado de carregamento com Spinner", () => {
    vi.spyOn(omdbApi, "getMovieById").mockImplementation(() => new Promise(() => {}));
    render(<MovieDetail movieId="tt0133093" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/carregando detalhes do filme/i)).toBeInTheDocument();
  });

  it("renderiza o estado de filme não encontrado com link para nova busca", async () => {
    vi.spyOn(omdbApi, "getMovieById").mockResolvedValueOnce(null);
    render(<MovieDetail movieId="tt0000000" />);

    expect(await screen.findByText("Filme não encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("Não encontramos o filme solicitado no catálogo."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /fazer uma nova busca/i })).toBeInTheDocument();
  });

  it("renderiza o estado de erro com mensagem de alerta", async () => {
    vi.spyOn(omdbApi, "getMovieById").mockRejectedValueOnce(
      new Error("Erro de conexão com a API"),
    );
    render(<MovieDetail movieId="tt0133093" />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Erro ao carregar filme")).toBeInTheDocument();
    expect(screen.getByText("Erro de conexão com a API")).toBeInTheDocument();
  });

  it("renderiza dados completos e link de retorno à busca", async () => {
    vi.spyOn(omdbApi, "getMovieById").mockResolvedValueOnce(fullMovie);
    render(<MovieDetail movieId="tt0133093" />);

    expect(await screen.findByRole("heading", { level: 1, name: "The Matrix" })).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getByText("136 min")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
    expect(screen.getByText(/Lana Wachowski, Lilly Wachowski/)).toBeInTheDocument();
    expect(screen.getByText(/Keanu Reeves, Laurence Fishburne/)).toBeInTheDocument();
    expect(
      screen.getByText("Um hacker descobre a chocante verdade sobre sua realidade."),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Poster de The Matrix")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar para a busca/i })).toHaveAttribute("href", "/");
    expect(screen.getByText("Ainda sem avaliações")).toBeInTheDocument();
  });

  it('nunca exibe a literal "N/A" e mostra fallbacks discretos quando metadados são parciais', async () => {
    const partialMovie: MovieDetailType = {
      id: "tt9999999",
      title: "Filme Sem Metadados",
      year: null,
      runtime: null,
      genres: [],
      director: null,
      actors: null,
      plot: null,
      posterUrl: null,
      ratingAvg: null,
      ratingCount: 0,
    };

    vi.spyOn(omdbApi, "getMovieById").mockResolvedValueOnce(partialMovie);
    render(<MovieDetail movieId="tt9999999" />);

    expect(await screen.findByRole("heading", { level: 1, name: "Filme Sem Metadados" })).toBeInTheDocument();
    expect(screen.getByText("Sem poster")).toBeInTheDocument();
    expect(screen.getByText("Não informada")).toBeInTheDocument();
    expect(screen.getByText("Não informado")).toBeInTheDocument();
    expect(screen.getByText("Sinopse não informada.")).toBeInTheDocument();
    expect(screen.queryByText(/N\/A/)).not.toBeInTheDocument();
  });

  it("renderiza a nota média quando disponível", async () => {
    const ratedMovie: MovieDetailType = {
      ...fullMovie,
      ratingAvg: 4.8,
      ratingCount: 15,
    };

    vi.spyOn(omdbApi, "getMovieById").mockResolvedValueOnce(ratedMovie);
    render(<MovieDetail movieId="tt0133093" />);

    expect(await screen.findByText("4,8")).toBeInTheDocument();
    expect(screen.getByText("/ 5")).toBeInTheDocument();
    expect(screen.getByText(/\(15 avaliações\)/)).toBeInTheDocument();
  });

  it("renderiza conteúdo no slot inferior de avaliações (RN-04)", async () => {
    vi.spyOn(omdbApi, "getMovieById").mockResolvedValueOnce(fullMovie);
    render(
      <MovieDetail movieId="tt0133093">
        <div data-testid="reviews-slot">Seção de Avaliações Mockada</div>
      </MovieDetail>,
    );

    expect(await screen.findByTestId("reviews-slot")).toBeInTheDocument();
    expect(screen.getByText("Seção de Avaliações Mockada")).toBeInTheDocument();
  });
});
