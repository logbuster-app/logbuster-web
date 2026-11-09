import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/lib/errors";

const envMock = vi.hoisted(() => ({
  omdbApiKey: "test-key",
  omdbBaseUrl: "https://www.omdbapi.com",
}));
vi.mock("@/shared/config/env", () => ({ env: envMock }));

import {
  OMDB_PAGE_SIZE,
  getMovieById,
  searchMovies,
  toMovieDetail,
  toMovieSummary,
} from "./omdb";

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("toMovieSummary", () => {
  it("converte o item da OMDb para o modelo de domínio", () => {
    expect(
      toMovieSummary({
        Title: "The Matrix",
        Year: "1999",
        imdbID: "tt0133093",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/x.jpg",
      }),
    ).toEqual({
      id: "tt0133093",
      title: "The Matrix",
      year: "1999",
      posterUrl: "https://m.media-amazon.com/images/M/x.jpg",
    });
  });

  it('trata Poster "N/A" como ausência de imagem', () => {
    const movie = toMovieSummary({
      Title: "X",
      Year: "2000",
      imdbID: "tt1",
      Type: "movie",
      Poster: "N/A",
    });
    expect(movie.posterUrl).toBeNull();
  });
});

describe("searchMovies", () => {
  beforeEach(() => {
    envMock.omdbApiKey = "test-key";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("monta a URL com chave, texto, tipo e página", async () => {
    const fetchMock = mockFetch({
      Response: "True",
      Search: [
        { Title: "The Matrix", Year: "1999", imdbID: "tt0133093", Type: "movie", Poster: "N/A" },
      ],
      totalResults: "25",
    });

    const result = await searchMovies("  matrix ", 2);

    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.origin + url.pathname).toBe("https://www.omdbapi.com/");
    expect(url.searchParams.get("apikey")).toBe("test-key");
    expect(url.searchParams.get("s")).toBe("matrix");
    expect(url.searchParams.get("type")).toBe("movie");
    expect(url.searchParams.get("page")).toBe("2");
    expect(result).toMatchObject({ total: 25, page: 2, pageSize: OMDB_PAGE_SIZE });
    expect(result.movies).toHaveLength(1);
  });

  it("retorna lista vazia quando nada é encontrado", async () => {
    mockFetch({ Response: "False", Error: "Movie not found!" });
    const result = await searchMovies("zzzzzz");
    expect(result.movies).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("falha com mensagem clara quando a busca é ampla demais", async () => {
    mockFetch({ Response: "False", Error: "Too many results." });
    await expect(searchMovies("a")).rejects.toThrow(/mais específico/);
  });

  it("falha quando a chave não está configurada", async () => {
    envMock.omdbApiKey = "";
    await expect(searchMovies("matrix")).rejects.toMatchObject({ code: "config" });
  });

  it("falha quando a OMDb recusa a chave", async () => {
    mockFetch({ Response: "False", Error: "Invalid API key!" });
    await expect(searchMovies("matrix")).rejects.toMatchObject({ code: "config" });
  });

  it("trata 401 como chave inválida", async () => {
    mockFetch({}, { ok: false, status: 401 });
    await expect(searchMovies("matrix")).rejects.toMatchObject({ code: "config" });
  });

  it("trata outros erros HTTP como falha do serviço", async () => {
    mockFetch({}, { ok: false, status: 500 });
    await expect(searchMovies("matrix")).rejects.toMatchObject({ code: "upstream" });
  });

  it("trata falha de rede", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const promise = searchMovies("matrix");
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ code: "network" });
  });
});

describe("toMovieDetail", () => {
  it("converte metadados completos da OMDb para MovieDetail", () => {
    const detail = toMovieDetail({
      imdbID: "tt0133093",
      Title: "The Matrix",
      Year: "1999",
      Runtime: "136 min",
      Genre: "Action, Sci-Fi",
      Director: "Lana Wachowski, Lilly Wachowski",
      Actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
      Plot: "When a beautiful stranger leads computer hacker Neo...",
      Poster: "https://m.media-amazon.com/poster.jpg",
    });

    expect(detail).toEqual({
      id: "tt0133093",
      title: "The Matrix",
      year: "1999",
      runtime: "136 min",
      genres: ["Action", "Sci-Fi"],
      director: "Lana Wachowski, Lilly Wachowski",
      actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
      plot: "When a beautiful stranger leads computer hacker Neo...",
      posterUrl: "https://m.media-amazon.com/poster.jpg",
      ratingAvg: null,
      ratingCount: 0,
    });
  });

  it('normaliza campos "N/A" ou vazios para null e genres para []', () => {
    const detail = toMovieDetail({
      imdbID: "tt9999999",
      Title: "Filme Obscuro",
      Year: "N/A",
      Runtime: "N/A",
      Genre: "N/A",
      Director: "N/A",
      Actors: "N/A",
      Plot: "N/A",
      Poster: "N/A",
    });

    expect(detail).toEqual({
      id: "tt9999999",
      title: "Filme Obscuro",
      year: null,
      runtime: null,
      genres: [],
      director: null,
      actors: null,
      plot: null,
      posterUrl: null,
      ratingAvg: null,
      ratingCount: 0,
    });
  });

  it("trata campos indefinidos ou com espaços em branco", () => {
    const detail = toMovieDetail({
      imdbID: "tt123",
      Title: "Sem Dados",
      Year: "  ",
      Genre: " , Action, N/A ",
    });

    expect(detail.year).toBeNull();
    expect(detail.genres).toEqual(["Action"]);
    expect(detail.director).toBeNull();
    expect(detail.plot).toBeNull();
    expect(detail.posterUrl).toBeNull();
  });
});

describe("getMovieById", () => {
  beforeEach(() => {
    envMock.omdbApiKey = "test-key";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("busca filme com parâmetros i e plot=full e retorna MovieDetail", async () => {
    const fetchMock = mockFetch({
      Response: "True",
      imdbID: "tt0133093",
      Title: "The Matrix",
      Year: "1999",
      Runtime: "136 min",
      Genre: "Action, Sci-Fi",
      Director: "Lana Wachowski, Lilly Wachowski",
      Actors: "Keanu Reeves",
      Plot: "Neo descobre a Matrix.",
      Poster: "https://poster.jpg",
    });

    const result = await getMovieById("tt0133093");

    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.searchParams.get("i")).toBe("tt0133093");
    expect(url.searchParams.get("plot")).toBe("full");
    expect(result).not.toBeNull();
    expect(result?.title).toBe("The Matrix");
    expect(result?.genres).toEqual(["Action", "Sci-Fi"]);
  });

  it('retorna null quando a OMDb responde com Response: "False"', async () => {
    mockFetch({
      Response: "False",
      Error: "Incorrect IMDb ID.",
    });

    const result = await getMovieById("tt0000000");
    expect(result).toBeNull();
  });

  it('retorna null para erro "Movie not found!"', async () => {
    mockFetch({
      Response: "False",
      Error: "Movie not found!",
    });

    const result = await getMovieById("tt9999999");
    expect(result).toBeNull();
  });

  it("lança erro de configuração quando a chave é recusada", async () => {
    mockFetch({
      Response: "False",
      Error: "Invalid API key!",
    });

    await expect(getMovieById("tt0133093")).rejects.toMatchObject({
      code: "config",
    });
  });
});

