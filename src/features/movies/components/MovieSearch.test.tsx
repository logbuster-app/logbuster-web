import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ push: vi.fn(), query: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => new URLSearchParams(nav.query ? `q=${nav.query}` : ""),
}));
vi.mock("@/shared/config/env", () => ({
  env: { omdbApiKey: "k", omdbBaseUrl: "https://www.omdbapi.com" },
}));

import { MovieSearch } from "./MovieSearch";

function item(n: number) {
  return {
    Title: `Filme ${n}`,
    Year: "2000",
    imdbID: `tt${n}`,
    Type: "movie",
    Poster: "N/A",
  };
}

function respond(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

describe("MovieSearch", () => {
  beforeEach(() => {
    nav.push.mockClear();
    nav.query = "";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mostra o estado inicial sem consultar a API", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<MovieSearch />);

    expect(screen.getByText("Comece sua busca")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
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
        respond({ Response: "True", Search: [item(1), item(2)], totalResults: "2" }),
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
      vi.fn().mockResolvedValue(respond({ Response: "False", Error: "Movie not found!" })),
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
        respond({ Response: "True", Search: [item(1)], totalResults: "2" }),
      )
      .mockResolvedValueOnce(
        respond({ Response: "True", Search: [item(2)], totalResults: "2" }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<MovieSearch />);

    await userEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));

    expect(await screen.findByText("Filme 2")).toBeInTheDocument();
    expect(screen.getByText("Filme 1")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument(),
    );
    const secondUrl = fetchMock.mock.calls[1][0] as URL;
    expect(secondUrl.searchParams.get("page")).toBe("2");
  });

  it("avisa quando falha ao carregar mais, mantendo os resultados", async () => {
    nav.query = "filme";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          respond({ Response: "True", Search: [item(1)], totalResults: "2" }),
        )
        .mockRejectedValueOnce(new TypeError("offline")),
    );
    render(<MovieSearch />);

    await userEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Filme 1")).toBeInTheDocument();
  });
});
