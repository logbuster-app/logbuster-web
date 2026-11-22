import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const envMock = vi.hoisted(() => ({
  apiBaseUrl: "http://localhost:8000",
  useApiMocks: false,
}));
vi.mock("@/shared/config/env", () => ({ env: envMock }));

import {
  REVIEW_SUMMARY_TIMEOUT_MS,
  SPOILER_CHECK_TIMEOUT_MS,
  checkSpoiler,
  fetchReviewSummary,
  toReviewSummary,
} from "./reviewAi";
import * as reviewAiMock from "./reviewAi.mock";

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("toReviewSummary", () => {
  it("converte status ready com texto e data em UTC", () => {
    expect(
      toReviewSummary({ status: "ready", text: "  Um bom resumo.  ", generated_at: "2026-11-09T12:00:00Z" }),
    ).toEqual({ status: "ready", text: "Um bom resumo.", generatedAt: "2026-11-09T12:00:00Z" });
  });

  it("mantém insufficient_reviews", () => {
    expect(toReviewSummary({ status: "insufficient_reviews" })).toEqual({
      status: "insufficient_reviews",
    });
  });

  it("trata unavailable, status desconhecido e ready sem texto como unavailable", () => {
    expect(toReviewSummary({ status: "unavailable" })).toEqual({ status: "unavailable" });
    expect(toReviewSummary({ status: "outra-coisa" })).toEqual({ status: "unavailable" });
    expect(toReviewSummary({ status: "ready", text: "   " })).toEqual({ status: "unavailable" });
    expect(toReviewSummary({})).toEqual({ status: "unavailable" });
  });

  it("aceita ready sem generated_at (a data só deixa de aparecer)", () => {
    expect(toReviewSummary({ status: "ready", text: "Resumo." })).toEqual({
      status: "ready",
      text: "Resumo.",
      generatedAt: "",
    });
  });
});

describe("fetchReviewSummary", () => {
  beforeEach(() => {
    envMock.useApiMocks = false;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("chama GET /api/v1/movies/{id}/review-summary", async () => {
    const fetchMock = mockFetch({
      movie_id: "tt0133093",
      status: "ready",
      text: "Resumo da comunidade.",
      generated_at: "2026-11-09T12:00:00Z",
    });

    const result = await fetchReviewSummary("tt0133093");

    const [urlArg, initArg] = fetchMock.mock.calls[0];
    expect(new URL(urlArg).pathname).toBe("/api/v1/movies/tt0133093/review-summary");
    expect(initArg.method).toBe("GET");
    expect(result).toEqual({
      status: "ready",
      text: "Resumo da comunidade.",
      generatedAt: "2026-11-09T12:00:00Z",
    });
  });

  it("devolve unavailable quando o backend responde erro", async () => {
    mockFetch({}, { ok: false, status: 502 });
    await expect(fetchReviewSummary("tt0133093")).resolves.toEqual({ status: "unavailable" });
  });

  it("devolve unavailable em falha de rede", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(fetchReviewSummary("tt0133093")).resolves.toEqual({ status: "unavailable" });
  });

  it("não faz a requisição quando já chega cancelado", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    controller.abort();

    await expect(fetchReviewSummary("tt-abortado", controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("chamadas simultâneas do mesmo filme compartilham uma única requisição", async () => {
    const fetchMock = mockFetch({ status: "ready", text: "Resumo.", generated_at: "2026-11-09T12:00:00Z" });

    const [first, second] = await Promise.all([
      fetchReviewSummary("tt-compartilhado"),
      fetchReviewSummary("tt-compartilhado"),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(first.status).toBe("ready");
  });

  it("cancelar uma chamada não derruba a requisição compartilhada (modo estrito do React)", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const firstController = new AbortController();
    const first = fetchReviewSummary("tt-estrito", firstController.signal);
    const firstResult = expect(first).rejects.toMatchObject({ name: "AbortError" });
    firstController.abort();

    const second = fetchReviewSummary("tt-estrito", new AbortController().signal);
    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({ status: "ready", text: "Resumo.", generated_at: "2026-11-09T12:00:00Z" }),
    });

    await firstResult;
    await expect(second).resolves.toMatchObject({ status: "ready", text: "Resumo." });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("depois que a requisição termina, uma nova chamada consulta o backend de novo", async () => {
    const fetchMock = mockFetch({ status: "unavailable" });

    await fetchReviewSummary("tt-de-novo");
    await fetchReviewSummary("tt-de-novo");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("estoura o teto de 30 s e trata como unavailable", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );

    const pending = fetchReviewSummary("tt-demorado", new AbortController().signal);
    await vi.advanceTimersByTimeAsync(REVIEW_SUMMARY_TIMEOUT_MS);

    await expect(pending).resolves.toEqual({ status: "unavailable" });
  });

  it("delega para o mock quando env.useApiMocks for true", async () => {
    envMock.useApiMocks = true;
    const spy = vi
      .spyOn(reviewAiMock, "fetchReviewSummaryMock")
      .mockResolvedValueOnce({ status: "insufficient_reviews" });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchReviewSummary("tt0133093")).resolves.toEqual({
      status: "insufficient_reviews",
    });
    expect(spy).toHaveBeenCalledWith("tt0133093");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("checkSpoiler", () => {
  beforeEach(() => {
    envMock.useApiMocks = false;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("envia POST /api/v1/reviews/spoiler-check com { movie_id, content }", async () => {
    const fetchMock = mockFetch({ status: "suspected" });

    await expect(checkSpoiler("tt0133093", "Neo morre no final.")).resolves.toBe("suspected");

    const [urlArg, initArg] = fetchMock.mock.calls[0];
    expect(new URL(urlArg).pathname).toBe("/api/v1/reviews/spoiler-check");
    expect(initArg.method).toBe("POST");
    expect(JSON.parse(initArg.body)).toEqual({
      movie_id: "tt0133093",
      content: "Neo morre no final.",
    });
  });

  it("devolve clear quando o backend não vê spoiler", async () => {
    mockFetch({ status: "clear" });
    await expect(checkSpoiler("tt0133093", "Gostei muito da fotografia.")).resolves.toBe("clear");
  });

  it("trata unavailable, status desconhecido e erro de servidor como unavailable", async () => {
    mockFetch({ status: "unavailable" });
    await expect(checkSpoiler("tt1", "Conteúdo qualquer aqui.")).resolves.toBe("unavailable");

    mockFetch({ status: "talvez" });
    await expect(checkSpoiler("tt1", "Conteúdo qualquer aqui.")).resolves.toBe("unavailable");

    mockFetch({}, { ok: false, status: 500 });
    await expect(checkSpoiler("tt1", "Conteúdo qualquer aqui.")).resolves.toBe("unavailable");

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(checkSpoiler("tt1", "Conteúdo qualquer aqui.")).resolves.toBe("unavailable");
  });

  it("estoura o timeout de 10 s e trata como unavailable", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );

    const pending = checkSpoiler("tt0133093", "Texto que demora para ser analisado.");
    await vi.advanceTimersByTimeAsync(SPOILER_CHECK_TIMEOUT_MS - 1);
    let settled = false;
    void pending.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toBe("unavailable");
  });

  it("delega para o mock quando env.useApiMocks for true", async () => {
    envMock.useApiMocks = true;
    const spy = vi.spyOn(reviewAiMock, "checkSpoilerMock").mockResolvedValueOnce("clear");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(checkSpoiler("tt0133093", "Texto qualquer para o mock.")).resolves.toBe("clear");
    expect(spy).toHaveBeenCalledWith("tt0133093", "Texto qualquer para o mock.");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
