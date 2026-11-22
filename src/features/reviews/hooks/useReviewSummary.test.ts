import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as reviewAi from "../api/reviewAi";
import { useReviewSummary } from "./useReviewSummary";

describe("useReviewSummary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("começa em loading e entrega o resumo pronto", async () => {
    const spy = vi.spyOn(reviewAi, "fetchReviewSummary").mockResolvedValueOnce({
      status: "ready",
      text: "Resumo.",
      generatedAt: "2026-11-09T12:00:00Z",
    });

    const { result } = renderHook(() => useReviewSummary("tt0133093"));
    expect(result.current).toEqual({ status: "loading" });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current).toEqual({
      status: "ready",
      text: "Resumo.",
      generatedAt: "2026-11-09T12:00:00Z",
    });
    expect(spy).toHaveBeenCalledWith("tt0133093", expect.any(AbortSignal));
  });

  it("esconde o bloco quando há menos de 3 avaliações", async () => {
    vi.spyOn(reviewAi, "fetchReviewSummary").mockResolvedValueOnce({
      status: "insufficient_reviews",
    });

    const { result } = renderHook(() => useReviewSummary("tt0133093"));
    await waitFor(() => expect(result.current.status).toBe("hidden"));
  });

  it("devolve unavailable quando a IA falha", async () => {
    vi.spyOn(reviewAi, "fetchReviewSummary").mockResolvedValueOnce({ status: "unavailable" });

    const { result } = renderHook(() => useReviewSummary("tt0133093"));
    await waitFor(() => expect(result.current.status).toBe("unavailable"));
  });

  it("trata uma rejeição inesperada como unavailable", async () => {
    vi.spyOn(reviewAi, "fetchReviewSummary").mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useReviewSummary("tt0133093"));
    await waitFor(() => expect(result.current.status).toBe("unavailable"));
  });

  it("fica oculto sem id de filme e não chama o backend", () => {
    const spy = vi.spyOn(reviewAi, "fetchReviewSummary");

    const { result } = renderHook(() => useReviewSummary("  "));

    expect(result.current).toEqual({ status: "hidden" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("cancela a requisição ao desmontar", async () => {
    let signal: AbortSignal | undefined;
    vi.spyOn(reviewAi, "fetchReviewSummary").mockImplementationOnce((_id, s) => {
      signal = s;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => useReviewSummary("tt0133093"));
    unmount();

    expect(signal?.aborted).toBe(true);
  });

  it("volta a carregar quando o filme muda", async () => {
    vi.spyOn(reviewAi, "fetchReviewSummary")
      .mockResolvedValueOnce({ status: "ready", text: "Primeiro.", generatedAt: "2026-11-09T12:00:00Z" })
      .mockReturnValueOnce(new Promise(() => {}));

    const { result, rerender } = renderHook(({ id }) => useReviewSummary(id), {
      initialProps: { id: "tt1" },
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));

    rerender({ id: "tt2" });
    expect(result.current).toEqual({ status: "loading" });
  });
});
