import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as reviewsApi from "../api/reviews";
import type { Review, ReviewListPage } from "../types";
import { useMovieReviews } from "./useMovieReviews";

describe("useMovieReviews", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sampleReview: Review = {
    id: "r1",
    movieId: "tt0133093",
    authorName: "Thyago",
    rating: 4.5,
    content: "Análise muito boa.",
    isSpoiler: false,
    highlights: ["direction"],
    counts: { like: 2, spoiler: 0, wellArgued: 5 },
    viewerInteractions: [],
    createdAt: "2026-11-08T18:30:00Z",
  };

  const samplePage: ReviewListPage = {
    items: [sampleReview],
    total: 1,
    page: 1,
    pageSize: 10,
    sort: "well_argued",
  };

  it("carrega avaliações com ordenação padrão well_argued", async () => {
    const fetchSpy = vi
      .spyOn(reviewsApi, "fetchMovieReviews")
      .mockResolvedValueOnce(samplePage);

    const { result } = renderHook(() => useMovieReviews("tt0133093"));

    expect(result.current.status).toBe("loading");
    expect(result.current.sort).toBe("well_argued");

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "tt0133093",
      expect.objectContaining({ sort: "well_argued" }),
      expect.any(AbortSignal),
    );
    expect(result.current.reviews).toEqual([sampleReview]);
    expect(result.current.total).toBe(1);
  });

  it("retorna status empty quando não há avaliações", async () => {
    vi.spyOn(reviewsApi, "fetchMovieReviews").mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      sort: "well_argued",
    });

    const { result } = renderHook(() => useMovieReviews("tt0000000"));

    await waitFor(() => {
      expect(result.current.status).toBe("empty");
    });

    expect(result.current.reviews).toEqual([]);
  });

  it("retorna status error quando a busca falha", async () => {
    vi.spyOn(reviewsApi, "fetchMovieReviews").mockRejectedValueOnce(
      new Error("Falha de conexão"),
    );

    const { result } = renderHook(() => useMovieReviews("tt0133093"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.errorMessage).toBe("Falha de conexão");
  });

  it("permite trocar ordenação via changeSort", async () => {
    vi.spyOn(reviewsApi, "fetchMovieReviews")
      .mockResolvedValueOnce(samplePage)
      .mockResolvedValueOnce({
        ...samplePage,
        sort: "newest",
      });

    const { result } = renderHook(() => useMovieReviews("tt0133093"));

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    act(() => {
      result.current.changeSort("newest");
    });

    expect(result.current.sort).toBe("newest");

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });
  });

  it("atualiza contador da avaliação em toggleVote com sucesso", async () => {
    vi.spyOn(reviewsApi, "fetchMovieReviews").mockResolvedValueOnce(samplePage);
    vi.spyOn(reviewsApi, "toggleReviewInteraction").mockResolvedValueOnce({
      reviewId: "r1",
      type: "well_argued",
      active: true,
      counts: { like: 2, spoiler: 0, wellArgued: 6 },
      viewerInteractions: ["well_argued"],
    });

    const { result } = renderHook(() => useMovieReviews("tt0133093"));

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    await act(async () => {
      await result.current.toggleVote("r1", "well_argued");
    });

    expect(result.current.reviews[0].counts.wellArgued).toBe(6);
    expect(result.current.reviews[0].viewerInteractions).toEqual(["well_argued"]);
    expect(result.current.votingError).toBeNull();
  });

  it("exibe votingError quando toggleVote falha", async () => {
    vi.spyOn(reviewsApi, "fetchMovieReviews").mockResolvedValueOnce(samplePage);
    vi.spyOn(reviewsApi, "toggleReviewInteraction").mockRejectedValueOnce(
      new Error("Falha ao registrar voto"),
    );

    const { result } = renderHook(() => useMovieReviews("tt0133093"));

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    await act(async () => {
      await result.current.toggleVote("r1", "well_argued");
    });

    expect(result.current.votingError).toBe("Falha ao registrar voto");
  });
});
