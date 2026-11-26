import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Review } from "../types";

const envMock = vi.hoisted(() => ({ apiBaseUrl: "http://localhost:8000", useApiMocks: false }));
vi.mock("@/shared/config/env", () => ({ env: envMock }));

const fetchReviewMock = vi.hoisted(() => vi.fn());
vi.mock("../api/reviews", () => ({ fetchReview: fetchReviewMock }));

import {
  SPOILER_ANALYSIS_POLL_MS,
  SPOILER_ANALYSIS_WINDOW_MS,
  useSpoilerAnalysis,
} from "./useSpoilerAnalysis";

const review: Review = {
  id: "r1",
  movieId: "tt0133093",
  authorName: "Marina",
  authorId: "u1",
  rating: 4,
  content: "O Cypher trai a tripulação por um bife.",
  isSpoiler: false,
  highlights: [],
  counts: { like: 0, spoiler: 0, wellArgued: 0 },
  viewerInteractions: [],
  createdAt: "2026-11-26T12:00:00Z",
};

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("useSpoilerAnalysis", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    envMock.useApiMocks = false;
    fetchReviewMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mostra a análise e entrega a avaliação quando a IA marca spoiler", async () => {
    fetchReviewMock
      .mockResolvedValueOnce({ ...review, isSpoiler: false })
      .mockResolvedValueOnce({ ...review, isSpoiler: true });
    const onFlagged = vi.fn();
    const { result } = renderHook(() => useSpoilerAnalysis(onFlagged));

    act(() => result.current.track(review));
    expect(result.current.isAnalyzing("r1")).toBe(true);

    await advance(SPOILER_ANALYSIS_POLL_MS);
    expect(onFlagged).not.toHaveBeenCalled();

    await advance(SPOILER_ANALYSIS_POLL_MS);
    expect(onFlagged).toHaveBeenCalledWith(expect.objectContaining({ id: "r1", isSpoiler: true }));
    expect(result.current.isAnalyzing("r1")).toBe(false);
    expect(fetchReviewMock).toHaveBeenCalledTimes(2);
  });

  it("encerra em silêncio quando a IA não marca nada dentro da janela", async () => {
    fetchReviewMock.mockResolvedValue({ ...review, isSpoiler: false });
    const onFlagged = vi.fn();
    const { result } = renderHook(() => useSpoilerAnalysis(onFlagged));

    act(() => result.current.track(review));
    await advance(SPOILER_ANALYSIS_WINDOW_MS + SPOILER_ANALYSIS_POLL_MS);

    expect(result.current.isAnalyzing("r1")).toBe(false);
    expect(onFlagged).not.toHaveBeenCalled();
    const calls = fetchReviewMock.mock.calls.length;
    await advance(SPOILER_ANALYSIS_WINDOW_MS);
    expect(fetchReviewMock).toHaveBeenCalledTimes(calls);
  });

  it("continua tentando se uma consulta falhar", async () => {
    fetchReviewMock
      .mockRejectedValueOnce(new Error("rede"))
      .mockResolvedValueOnce({ ...review, isSpoiler: true });
    const onFlagged = vi.fn();
    const { result } = renderHook(() => useSpoilerAnalysis(onFlagged));

    act(() => result.current.track(review));
    await advance(SPOILER_ANALYSIS_POLL_MS * 2);

    expect(onFlagged).toHaveBeenCalledTimes(1);
  });

  it("não acompanha avaliação já marcada pelo autor nem no modo mock", async () => {
    const { result } = renderHook(() => useSpoilerAnalysis(vi.fn()));

    act(() => result.current.track({ ...review, isSpoiler: true }));
    envMock.useApiMocks = true;
    act(() => result.current.track(review));
    await advance(SPOILER_ANALYSIS_WINDOW_MS);

    expect(result.current.isAnalyzing("r1")).toBe(false);
    expect(fetchReviewMock).not.toHaveBeenCalled();
  });

  it("para de consultar ao sair da página", async () => {
    fetchReviewMock.mockResolvedValue({ ...review, isSpoiler: false });
    const { result, unmount } = renderHook(() => useSpoilerAnalysis(vi.fn()));

    act(() => result.current.track(review));
    unmount();
    await advance(SPOILER_ANALYSIS_WINDOW_MS);

    expect(fetchReviewMock).not.toHaveBeenCalled();
  });
});
