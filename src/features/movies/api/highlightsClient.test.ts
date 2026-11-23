import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const envMock = vi.hoisted(() => ({
  apiBaseUrl: "http://localhost:8000",
  useApiMocks: false,
}));
vi.mock("@/shared/config/env", () => ({ env: envMock }));

import { ApiError } from "@/shared/lib/errors";
import { HIGHLIGHTS_LIMIT, fetchHighlightedMovies, toHighlightedMovie } from "./highlightsClient";
import * as highlightsMock from "./highlights.mock";

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const backendItem = {
  id: "tt0133093",
  title: "Matrix",
  year: "1999",
  poster_url: "https://m.media-amazon.com/matrix.jpg",
  rating_avg: 4.5,
  rating_count: 10,
  highlight_count: 7,
};

describe("toHighlightedMovie", () => {
  it("converte o item do backend para o modelo de domínio", () => {
    expect(toHighlightedMovie(backendItem)).toEqual({
      id: "tt0133093",
      title: "Matrix",
      year: "1999",
      posterUrl: "https://m.media-amazon.com/matrix.jpg",
      ratingAvg: 4.5,
      ratingCount: 10,
      highlightCount: 7,
    });
  });

  it("aceita os campos nulos que o backend envia quando a OMDb falha", () => {
    expect(
      toHighlightedMovie({
        ...backendItem,
        title: "tt0133093",
        year: null,
        poster_url: null,
        rating_avg: null,
      }),
    ).toMatchObject({ title: "tt0133093", year: "", posterUrl: null, ratingAvg: null });
  });
});

describe("fetchHighlightedMovies", () => {
  beforeEach(() => {
    envMock.useApiMocks = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("chama GET /api/v1/highlights/{highlight}/movies com limit=10", async () => {
    const fetchMock = mockFetch({ items: [backendItem] });

    const result = await fetchHighlightedMovies("visual_effects");

    const [urlArg, initArg] = fetchMock.mock.calls[0];
    const url = new URL(urlArg);
    expect(url.pathname).toBe("/api/v1/highlights/visual_effects/movies");
    expect(url.searchParams.get("limit")).toBe(String(HIGHLIGHTS_LIMIT));
    expect(initArg.method).toBe("GET");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "tt0133093", highlightCount: 7 });
  });

  it("aceita outro limite e repassa o cancelamento", async () => {
    const fetchMock = mockFetch({ items: [] });
    const controller = new AbortController();

    await fetchHighlightedMovies("acting", 3, controller.signal);

    const [urlArg, initArg] = fetchMock.mock.calls[0];
    expect(new URL(urlArg).searchParams.get("limit")).toBe("3");
    expect(initArg.signal).toBe(controller.signal);
  });

  it("aspecto sem filmes devolve lista vazia", async () => {
    mockFetch({ items: [] });
    await expect(fetchHighlightedMovies("soundtrack")).resolves.toEqual([]);
  });

  it("mantém a ordem recebida do backend", async () => {
    mockFetch({
      items: [
        { ...backendItem, id: "tt0000002", highlight_count: 9 },
        { ...backendItem, id: "tt0000001", highlight_count: 3 },
      ],
    });
    const result = await fetchHighlightedMovies("acting");
    expect(result.map((movie) => movie.id)).toEqual(["tt0000002", "tt0000001"]);
  });

  it("converte erro do servidor em ApiError com a mensagem do backend", async () => {
    mockFetch(
      { error: { code: "VALIDATION_ERROR", message: "Dados inválidos.", details: [] } },
      { ok: false, status: 422 },
    );

    await expect(fetchHighlightedMovies("acting")).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      message: "Dados inválidos.",
    });
  });

  it("converte falha de rede em ApiError em português", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const error = await fetchHighlightedMovies("acting").catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("network");
    expect(error.message).toBe("Não foi possível conectar ao servidor para carregar os destaques.");
  });

  it("delega para o mock quando env.useApiMocks for true", async () => {
    envMock.useApiMocks = true;
    const spy = vi.spyOn(highlightsMock, "fetchHighlightedMoviesMock").mockResolvedValueOnce([]);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchHighlightedMovies("direction", 5)).resolves.toEqual([]);

    expect(spy).toHaveBeenCalledWith("direction", 5);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
