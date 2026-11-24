import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), query: "", highlight: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  useSearchParams: () =>
    new URLSearchParams(
      [nav.query && `q=${nav.query}`, nav.highlight && `destaque=${nav.highlight}`]
        .filter(Boolean)
        .join("&"),
    ),
}));

import { MovieSearch } from "./MovieSearch";

function item(n: number) {
  return { id: `tt${n}`, title: `Filme ${n}`, year: "2000", poster_url: null };
}

function pageOf(movies: ReturnType<typeof item>[], total: number, page = 1) {
  return { items: movies, total, page, page_size: 10 };
}

function respond(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

describe("MovieSearch", () => {
  beforeEach(() => {
    nav.push.mockClear();
    nav.replace.mockClear();
    nav.query = "";
    nav.highlight = "";
    // Sem busca, a home também consulta os destaques; por padrão, nenhum filme destacado.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond({ items: [] })));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sem busca, mostra os destaques da comunidade abaixo do campo de busca", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);
    render(<MovieSearch />);

    expect(screen.getByLabelText("Buscar filmes")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Destaques da comunidade" }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Ninguém destacou Trilha Sonora ainda/)).toBeInTheDocument();

    const urls = fetchMock.mock.calls.map(([url]) => new URL(url));
    expect(urls.every((url) => url.pathname.startsWith("/api/v1/highlights/"))).toBe(true);
    expect(urls.some((url) => url.pathname === "/api/v1/movies")).toBe(false);
  });

  it("com busca ativa, a seção de destaques não aparece nem consulta a API de destaques", async () => {
    nav.query = "filme";
    const fetchMock = vi.fn().mockResolvedValue(respond(pageOf([item(1)], 1)));
    vi.stubGlobal("fetch", fetchMock);
    render(<MovieSearch />);

    expect(await screen.findByText("Filme 1")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Destaques da comunidade" }),
    ).not.toBeInTheDocument();
    const paths = fetchMock.mock.calls.map(([url]) => new URL(url).pathname);
    expect(paths.some((path) => path.startsWith("/api/v1/highlights"))).toBe(false);
  });

  it("a busca continua funcionando quando os destaques falham", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    render(<MovieSearch />);

    expect(await screen.findByText("Não foi possível carregar os destaques")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Buscar filmes"), "matrix");
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(nav.push).toHaveBeenCalledWith("/?q=matrix");
  });

  it("atualiza a URL ao buscar", async () => {
    render(<MovieSearch />);
    await userEvent.type(screen.getByLabelText("Buscar filmes"), "the matrix");
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(nav.push).toHaveBeenCalledWith("/?q=the%20matrix");
  });

  it("lista os resultados da busca da URL", async () => {
    nav.query = "filme";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(pageOf([item(1), item(2)], 2)),
      ),
    );
    render(<MovieSearch />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(await screen.findByText("Filme 1")).toBeInTheDocument();
    expect(screen.getByText("Filme 2")).toBeInTheDocument();
    expect(screen.getByText(/2 resultados/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
  });

  it("mostra mensagem quando não há resultados", async () => {
    nav.query = "zzz";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respond(pageOf([], 0))),
    );
    render(<MovieSearch />);

    expect(await screen.findByText("Nenhum filme encontrado")).toBeInTheDocument();
  });

  it("mostra erro quando a API falha", async () => {
    nav.query = "filme";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    render(<MovieSearch />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível conectar");
  });

  it("carrega mais resultados ao clicar em Carregar mais", async () => {
    nav.query = "filme";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        respond(pageOf([item(1)], 2)),
      )
      .mockResolvedValueOnce(
        respond(pageOf([item(2)], 2, 2)),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<MovieSearch />);

    await userEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));

    expect(await screen.findByText("Filme 2")).toBeInTheDocument();
    expect(screen.getByText("Filme 1")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument(),
    );
    expect(fetchMock.mock.calls[1][0]).toBe("http://localhost:8000/api/v1/movies?q=filme&page=2");
  });

  it("avisa quando falha ao carregar mais, mantendo os resultados", async () => {
    nav.query = "filme";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          respond(pageOf([item(1)], 2)),
        )
        .mockRejectedValueOnce(new TypeError("offline")),
    );
    render(<MovieSearch />);

    await userEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Filme 1")).toBeInTheDocument();
  });
});
