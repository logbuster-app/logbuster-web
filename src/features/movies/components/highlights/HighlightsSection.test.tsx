import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ replace: vi.fn(), params: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(nav.params),
}));

import { ApiError } from "@/shared/lib/errors";
import type { Highlight } from "@/shared/lib/highlights";
import * as highlightsClient from "../../api/highlightsClient";
import type { HighlightedMovie } from "../../types";
import { HighlightsSection } from "./HighlightsSection";

function movie(id: string, title: string, highlightCount: number): HighlightedMovie {
  return { id, title, year: "1999", posterUrl: null, ratingAvg: 4.5, ratingCount: 3, highlightCount };
}

function plan(responses: Partial<Record<Highlight, HighlightedMovie[] | Error>>) {
  return vi.spyOn(highlightsClient, "fetchHighlightedMovies").mockImplementation(async (highlight) => {
    const response = responses[highlight] ?? [];
    if (response instanceof Error) throw response;
    return response;
  });
}

describe("HighlightsSection", () => {
  beforeEach(() => {
    nav.replace.mockClear();
    nav.params = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mostra o título, seis chips, um aspecto selecionado, a legenda e os filmes", async () => {
    plan({
      cinematography: [movie("tt0133093", "Matrix", 4), movie("tt0110912", "Pulp Fiction", 3)],
    });
    render(<HighlightsSection />);

    expect(screen.getByRole("heading", { name: "Destaques da comunidade" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(6);
    const matrix = await screen.findByRole("link", { name: "Ver detalhes de Matrix" });
    expect(screen.getByRole("radio", { name: "Fotografia" })).toBeChecked();
    // Cada card mostra a contagem do próprio filme, sem uma soma geral (RN-04).
    expect(within(matrix).getByText("4 destaques em Fotografia")).toBeInTheDocument();
    const pulp = screen.getByRole("link", { name: "Ver detalhes de Pulp Fiction" });
    expect(within(pulp).getByText("3 destaques em Fotografia")).toBeInTheDocument();
    expect(screen.queryByText("7 destaques em Fotografia")).not.toBeInTheDocument();
  });

  it("usa o singular na legenda quando há um único destaque", async () => {
    plan({ acting: [movie("tt1", "Filme Único", 1)] });
    render(<HighlightsSection />);

    expect(await screen.findByText("1 destaque em Atuação")).toBeInTheDocument();
  });

  it("clicar num filme leva à ficha do filme", async () => {
    plan({ acting: [movie("tt0133093", "Matrix", 2)] });
    render(<HighlightsSection />);

    const link = await screen.findByRole("link", { name: "Ver detalhes de Matrix" });
    expect(link).toHaveAttribute("href", "/movies/tt0133093");
  });

  it("trocar de aspecto atualiza a URL sem rolar a página", async () => {
    plan({ cinematography: [movie("tt1", "Filme A", 2)] });
    render(<HighlightsSection />);
    await screen.findByText("Filme A");

    await userEvent.click(screen.getByText("Direção"));

    expect(nav.replace).toHaveBeenCalledWith("/?destaque=direction", { scroll: false });
  });

  it("a escolha vem da URL: busca só o aspecto de ?destaque= e o marca", async () => {
    nav.params = "destaque=direction";
    const spy = plan({ direction: [movie("tt1", "Filme Direção", 5)] });
    render(<HighlightsSection />);

    expect(await screen.findByText("5 destaques em Direção")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Direção" })).toBeChecked();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("direction", 10, expect.any(AbortSignal));
  });

  it("ignora um ?destaque= inválido e volta ao padrão", async () => {
    nav.params = "destaque=inexistente";
    const spy = plan({ screenplay: [movie("tt1", "Filme Roteiro", 2)] });
    render(<HighlightsSection />);

    expect(await screen.findByText("2 destaques em Roteiro")).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(6);
  });

  it("o padrão é o primeiro aspecto que tem filmes", async () => {
    plan({ soundtrack: [], cinematography: [], screenplay: [movie("tt1", "Filme Roteiro", 2)], acting: [movie("tt2", "Outro", 9)] });
    render(<HighlightsSection />);

    expect(await screen.findByText("Filme Roteiro")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Roteiro" })).toBeChecked();
    expect(screen.queryByText("Outro")).not.toBeInTheDocument();
  });

  it("mostra carregando enquanto busca", () => {
    vi.spyOn(highlightsClient, "fetchHighlightedMovies").mockReturnValue(new Promise(() => {}));
    render(<HighlightsSection />);

    expect(screen.getByRole("status")).toHaveTextContent("Carregando destaques");
    expect(screen.getAllByRole("radio")).toHaveLength(6);
  });

  it("sem filmes em lugar nenhum, mostra a mensagem de vazio do primeiro aspecto", async () => {
    plan({});
    render(<HighlightsSection />);

    expect(await screen.findByText("Ninguém destacou Trilha Sonora ainda…")).toBeInTheDocument();
    expect(screen.queryByTestId("movie-grid")).not.toBeInTheDocument();
  });

  it("aspecto escolhido sem filmes mostra o vazio com o nome desse aspecto", async () => {
    nav.params = "destaque=visual_effects";
    plan({});
    render(<HighlightsSection />);

    expect(await screen.findByText("Ninguém destacou Efeitos Especiais ainda…")).toBeInTheDocument();
  });

  it("em erro, mostra mensagem neutra, mantém os chips e lembra que a busca funciona", async () => {
    plan({
      soundtrack: new ApiError("detalhe técnico do servidor"),
      cinematography: new ApiError("outro detalhe"),
      screenplay: new ApiError("x"),
      acting: new ApiError("x"),
      direction: new ApiError("x"),
      visual_effects: new ApiError("x"),
    });
    render(<HighlightsSection />);

    expect(await screen.findByText("Não foi possível carregar os destaques")).toBeInTheDocument();
    expect(screen.getByText(/A busca continua funcionando/)).toBeInTheDocument();
    expect(screen.queryByText(/detalhe técnico/)).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(6);
  });

  it("a grade mostra no máximo o que o backend devolveu (até 10) em uma única seção", async () => {
    const many = Array.from({ length: 10 }, (_, i) => movie(`tt${i}`, `Filme ${i}`, 10 - i));
    plan({ soundtrack: many });
    render(<HighlightsSection />);

    const grid = await screen.findByTestId("movie-grid");
    await waitFor(() => expect(within(grid).getAllByRole("link")).toHaveLength(10));
  });
});
