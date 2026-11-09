import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as omdbApi from "../api/moviesClient";
import { useMovieDetail } from "./useMovieDetail";

describe("useMovieDetail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("carrega detalhes do filme com sucesso", async () => {
    vi.spyOn(omdbApi, "getMovieById").mockResolvedValueOnce({
      id: "tt0133093",
      title: "The Matrix",
      year: "1999",
      runtime: "136 min",
      genres: ["Action", "Sci-Fi"],
      director: "Lana Wachowski",
      actors: "Keanu Reeves",
      plot: "Neo é acordado...",
      posterUrl: "https://poster.jpg",
      ratingAvg: null,
      ratingCount: 0,
    });

    const { result } = renderHook(() => useMovieDetail("tt0133093"));

    expect(result.current.status).toBe("loading");
    expect(result.current.movie).toBeNull();

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(result.current.movie?.title).toBe("The Matrix");
    expect(result.current.error).toBeNull();
  });

  it('retorna estado not_found quando getMovieById retorna null', async () => {
    vi.spyOn(omdbApi, "getMovieById").mockResolvedValueOnce(null);

    const { result } = renderHook(() => useMovieDetail("tt0000000"));

    await waitFor(() => {
      expect(result.current.status).toBe("not_found");
    });

    expect(result.current.movie).toBeNull();
  });

  it("retorna estado not_found imediatamente se o id for vazio", async () => {
    const spy = vi.spyOn(omdbApi, "getMovieById");

    const { result } = renderHook(() => useMovieDetail("   "));

    expect(result.current.status).toBe("not_found");
    expect(spy).not.toHaveBeenCalled();
  });

  it("trata erro de requisição", async () => {
    vi.spyOn(omdbApi, "getMovieById").mockRejectedValueOnce(
      new Error("Falha na rede"),
    );

    const { result } = renderHook(() => useMovieDetail("tt0133093"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.error).toBe("Falha na rede");
    expect(result.current.movie).toBeNull();
  });

  it("permite recarregar via reload", async () => {
    const spy = vi
      .spyOn(omdbApi, "getMovieById")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "tt0133093",
        title: "The Matrix",
        year: "1999",
        runtime: "136 min",
        genres: ["Action"],
        director: "Lana",
        actors: "Keanu",
        plot: "Plot",
        posterUrl: null,
        ratingAvg: null,
        ratingCount: 0,
      });

    const { result } = renderHook(() => useMovieDetail("tt0133093"));

    await waitFor(() => {
      expect(result.current.status).toBe("not_found");
    });

    act(() => {
      result.current.reload();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
