import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/lib/errors";
import { HIGHLIGHTS, type Highlight } from "@/shared/lib/highlights";
import * as highlightsClient from "../api/highlightsClient";
import type { HighlightedMovie } from "../types";
import { useHighlightedMovies } from "./useHighlightedMovies";

function movie(id: string, highlightCount = 1): HighlightedMovie {
  return { id, title: `Filme ${id}`, year: "2000", posterUrl: null, ratingAvg: 4, ratingCount: 1, highlightCount };
}

type Plan = Partial<Record<Highlight, HighlightedMovie[] | Error>>;

/** Responde cada aspecto conforme o plano; aspecto fora do plano devolve lista vazia. */
function plan(responses: Plan) {
  return vi.spyOn(highlightsClient, "fetchHighlightedMovies").mockImplementation(async (highlight) => {
    const response = responses[highlight] ?? [];
    if (response instanceof Error) throw response;
    return response;
  });
}

describe("useHighlightedMovies", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sem aspecto pedido, busca os seis com limite 10 e escolhe o primeiro que tem filmes", async () => {
    const spy = plan({ cinematography: [movie("tt1")], acting: [movie("tt2")] });

    const { result } = renderHook(() => useHighlightedMovies(null));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.selected).toBe("cinematography");
    expect(result.current.movies.map((m) => m.id)).toEqual(["tt1"]);
    expect(spy).toHaveBeenCalledTimes(6);
    expect(spy.mock.calls.map(([highlight]) => highlight)).toEqual([...HIGHLIGHTS]);
    expect(spy.mock.calls.every(([, limit]) => limit === 10)).toBe(true);
  });

  it("enquanto descobre o padrão, está carregando e nenhum aspecto está selecionado", () => {
    vi.spyOn(highlightsClient, "fetchHighlightedMovies").mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useHighlightedMovies(null));

    expect(result.current).toEqual({ status: "loading", selected: null, movies: [], error: null });
  });

  it("espera os aspectos anteriores responderem antes de escolher o padrão", async () => {
    let resolveSoundtrack: (movies: HighlightedMovie[]) => void = () => {};
    vi.spyOn(highlightsClient, "fetchHighlightedMovies").mockImplementation((highlight) => {
      if (highlight === "soundtrack") {
        return new Promise((resolve) => {
          resolveSoundtrack = resolve;
        });
      }
      return Promise.resolve(highlight === "acting" ? [movie("tt-acting")] : []);
    });

    const { result } = renderHook(() => useHighlightedMovies(null));
    // Os outros cinco já responderam, mas Trilha Sonora (a primeira) ainda não.
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.status).toBe("loading");
    expect(result.current.selected).toBeNull();

    await act(async () => {
      resolveSoundtrack([movie("tt-soundtrack")]);
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.selected).toBe("soundtrack");
  });

  it("sem filmes em nenhum aspecto, fica com o primeiro e a lista vazia", async () => {
    plan({});

    const { result } = renderHook(() => useHighlightedMovies(null));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.selected).toBe("soundtrack");
    expect(result.current.movies).toEqual([]);
  });

  it("se um aspecto falha mas outro tem filmes, mostra o primeiro que tem filmes", async () => {
    plan({ soundtrack: new ApiError("falhou"), direction: [movie("tt-dir")] });

    const { result } = renderHook(() => useHighlightedMovies(null));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.selected).toBe("direction");
  });

  it("se nenhum tem filmes e algum falhou, não afirma que está vazio: erro", async () => {
    plan({ acting: new ApiError("falhou") });

    const { result } = renderHook(() => useHighlightedMovies(null));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.selected).toBe("soundtrack");
    expect(result.current.error).toBe("falhou");
  });

  it("se todos falham, é erro com a mensagem do primeiro", async () => {
    vi.spyOn(highlightsClient, "fetchHighlightedMovies").mockRejectedValue(
      new ApiError("Sem conexão.", "network"),
    );

    const { result } = renderHook(() => useHighlightedMovies(null));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Sem conexão.");
  });

  it("converte erro desconhecido em mensagem em português", async () => {
    vi.spyOn(highlightsClient, "fetchHighlightedMovies").mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useHighlightedMovies("acting"));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Algo deu errado ao carregar os destaques.");
  });

  it("com aspecto pedido, busca só ele", async () => {
    const spy = plan({ acting: [movie("tt1", 5), movie("tt2", 2)] });

    const { result } = renderHook(() => useHighlightedMovies("acting"));

    expect(result.current).toMatchObject({ status: "loading", selected: "acting" });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.movies.map((m) => m.id)).toEqual(["tt1", "tt2"]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("acting", 10, expect.any(AbortSignal));
  });

  it("aspecto pedido sem filmes é sucesso com lista vazia", async () => {
    plan({});

    const { result } = renderHook(() => useHighlightedMovies("screenplay"));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current).toMatchObject({ selected: "screenplay", movies: [] });
  });

  it("depois da primeira carga, trocar de aspecto usa o que já foi buscado", async () => {
    const spy = plan({ cinematography: [movie("tt-cine")], acting: [movie("tt-acting")] });
    const { result, rerender } = renderHook(({ requested }) => useHighlightedMovies(requested), {
      initialProps: { requested: null as Highlight | null },
    });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(spy).toHaveBeenCalledTimes(6);

    rerender({ requested: "acting" });

    // Sem passar por "loading" e sem nova requisição.
    expect(result.current).toMatchObject({ status: "success", selected: "acting" });
    expect(result.current.movies.map((m) => m.id)).toEqual(["tt-acting"]);
    expect(spy).toHaveBeenCalledTimes(6);
  });

  it("ao abrir direto num aspecto, buscar os demais só acontece se voltar ao padrão", async () => {
    const spy = plan({ acting: [movie("tt-acting")] });
    const { result, rerender } = renderHook(({ requested }) => useHighlightedMovies(requested), {
      initialProps: { requested: "acting" as Highlight | null },
    });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(spy).toHaveBeenCalledTimes(1);

    rerender({ requested: null });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(6));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.selected).toBe("acting");
  });

  it("aspecto que deu erro é buscado de novo ao voltar a ele", async () => {
    const spy = vi
      .spyOn(highlightsClient, "fetchHighlightedMovies")
      .mockRejectedValueOnce(new ApiError("falhou"))
      .mockResolvedValue([movie("tt-ok")]);
    const { result, rerender } = renderHook(({ requested }) => useHighlightedMovies(requested), {
      initialProps: { requested: "acting" as Highlight | null },
    });
    await waitFor(() => expect(result.current.status).toBe("error"));

    rerender({ requested: "direction" });
    await waitFor(() => expect(result.current.status).toBe("success"));
    rerender({ requested: "acting" });

    await waitFor(() => expect(result.current).toMatchObject({ selected: "acting", status: "success" }));
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it("cancela as requisições ao desmontar e ignora respostas atrasadas", async () => {
    const signals: AbortSignal[] = [];
    vi.spyOn(highlightsClient, "fetchHighlightedMovies").mockImplementation((_h, _l, signal) => {
      if (signal) signals.push(signal);
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => useHighlightedMovies(null));
    unmount();

    expect(signals).toHaveLength(6);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
  });

  it("não marca erro quando a falha vem de uma requisição cancelada", async () => {
    const rejecters: ((err: unknown) => void)[] = [];
    vi.spyOn(highlightsClient, "fetchHighlightedMovies").mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejecters.push(reject);
        }),
    );
    const { result, rerender } = renderHook(({ requested }) => useHighlightedMovies(requested), {
      initialProps: { requested: "acting" as Highlight | null },
    });

    // Trocar de aspecto cancela a requisição de "acting" (a primeira).
    rerender({ requested: "direction" });
    await act(async () => {
      rejecters[0](new DOMException("Aborted", "AbortError"));
    });

    expect(result.current).toMatchObject({ selected: "direction", status: "loading" });

    // Já a falha de uma requisição ativa é registrada normalmente.
    await act(async () => {
      rejecters[1](new ApiError("falhou"));
    });
    expect(result.current).toMatchObject({ selected: "direction", status: "error" });
  });
});
