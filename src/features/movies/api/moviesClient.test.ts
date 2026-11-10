import { afterEach, describe, expect, it, vi } from "vitest";
import { getMovieById, searchMovies } from "./moviesClient";

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

afterEach(() => vi.unstubAllGlobals());

describe("serviço de filmes", () => {
  it("consulta e mapeia os resultados paginados do backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      items: [{ id: "tt0133093", title: "The Matrix", year: "1999", poster_url: null, rating_avg: 4.5, rating_count: 2 }],
      total: 11, page: 2, page_size: 10,
    }));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    expect(await searchMovies(" Matrix ", 2, signal)).toEqual({
      movies: [{ id: "tt0133093", title: "The Matrix", year: "1999", posterUrl: null }],
      total: 11, page: 2, pageSize: 10,
    });
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8000/api/v1/movies?q=Matrix&page=2");
    expect(fetchMock.mock.calls[0][1].signal).toBe(signal);
  });

  it("mantém resultados vazios e apresenta erros do backend", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ items: [], total: 0, page: 1, page_size: 10 }))
      .mockResolvedValueOnce(response({ error: { code: "UPSTREAM_ERROR", message: "Serviço indisponível." } }, 502));
    vi.stubGlobal("fetch", fetchMock);
    expect((await searchMovies("inexistente")).movies).toEqual([]);
    await expect(searchMovies("matrix")).rejects.toMatchObject({ message: "Serviço indisponível.", status: 502 });
  });

  it("mapeia detalhes e nota média do backend", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({
      id: "tt0133093", title: "The Matrix", year: "1999", runtime: "136 min",
      genres: ["Action"], director: null, actors: null, plot: null,
      poster_url: null, rating_avg: 4.25, rating_count: 2,
    })));
    expect(await getMovieById(" tt0133093 ")).toEqual({
      id: "tt0133093", title: "The Matrix", year: "1999", runtime: "136 min",
      genres: ["Action"], director: null, actors: null, plot: null,
      posterUrl: null, ratingAvg: 4.25, ratingCount: 2,
    });
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("http://localhost:8000/api/v1/movies/tt0133093");
  });

  it("retorna null para detalhe inexistente e propaga falhas e cancelamento", async () => {
    const abort = new DOMException("Cancelado", "AbortError");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: { message: "Não encontrado." } }, 404))
      .mockResolvedValueOnce(response({ error: { message: "Serviço indisponível." } }, 502))
      .mockRejectedValueOnce(abort);
    vi.stubGlobal("fetch", fetchMock);
    expect(await getMovieById(" ")).toBeNull();
    expect(await getMovieById("tt0000000")).toBeNull();
    await expect(getMovieById("tt0133093")).rejects.toMatchObject({ status: 502 });
    await expect(getMovieById("tt0133093")).rejects.toBe(abort);
  });
});
