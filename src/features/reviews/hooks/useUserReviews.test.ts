import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Review } from "../types";
import { useUserReviews } from "./useUserReviews";

const mockFetchUserReviews = vi.fn();
const mockToggleReviewInteraction = vi.fn();

vi.mock("../api/reviews", () => ({
  fetchUserReviews: (...args: unknown[]) => mockFetchUserReviews(...args),
  toggleReviewInteraction: (...args: unknown[]) => mockToggleReviewInteraction(...args),
}));

const sampleReview = (id: string, movieId = "tt0133093"): Review => ({
  id,
  movieId,
  authorName: "Ana",
  rating: 4.5,
  content: "Análise consistente sobre direção e fotografia.",
  isSpoiler: false,
  highlights: ["direction"],
  counts: { like: 2, spoiler: 0, wellArgued: 3 },
  viewerInteractions: [],
  createdAt: "2026-11-20T18:00:00Z",
});

afterEach(() => {
  mockFetchUserReviews.mockReset();
  mockToggleReviewInteraction.mockReset();
});

describe("useUserReviews", () => {
  it("carrega a primeira página e concatena páginas seguintes no loadMore", async () => {
    mockFetchUserReviews
      .mockResolvedValueOnce({
        items: [sampleReview("r1", "tt0133093")],
        total: 2,
        page: 1,
        pageSize: 10,
      })
      .mockResolvedValueOnce({
        items: [sampleReview("r2", "tt0317248")],
        total: 2,
        page: 2,
        pageSize: 10,
      });

    const { result } = renderHook(() => useUserReviews("user-1"));

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.reviews.map((item) => item.id)).toEqual(["r1", "r2"]);
    expect(result.current.hasMore).toBe(false);
  });

  it("retorna empty quando o perfil não tem avaliações e error em falha", async () => {
    mockFetchUserReviews.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });

    const { result: emptyResult } = renderHook(() => useUserReviews("user-empty"));
    await waitFor(() => expect(emptyResult.current.status).toBe("empty"));

    mockFetchUserReviews.mockRejectedValueOnce(new Error("Falha de rede"));
    const { result: errorResult } = renderHook(() => useUserReviews("user-error"));
    await waitFor(() => expect(errorResult.current.status).toBe("error"));
    expect(errorResult.current.errorMessage).toBe("Falha de rede");
  });

  it("atualiza contadores no voto e expõe erro quando o voto ou loadMore falha", async () => {
    mockFetchUserReviews
      .mockResolvedValueOnce({
        items: [sampleReview("r1")],
        total: 2,
        page: 1,
        pageSize: 10,
      })
      .mockRejectedValueOnce(new Error("Erro na página 2"));

    mockToggleReviewInteraction
      .mockResolvedValueOnce({
        reviewId: "r1",
        type: "like",
        active: true,
        counts: { like: 3, spoiler: 0, wellArgued: 3 },
        viewerInteractions: ["like"],
      })
      .mockRejectedValueOnce(new Error("Falha ao votar"));

    const { result } = renderHook(() => useUserReviews("user-1"));
    await waitFor(() => expect(result.current.status).toBe("success"));

    await act(async () => {
      await result.current.toggleVote("r1", "like");
    });
    expect(result.current.reviews[0].counts.like).toBe(3);
    expect(result.current.reviews[0].viewerInteractions).toEqual(["like"]);

    await act(async () => {
      await result.current.toggleVote("r1", "like");
    });
    expect(result.current.votingError).toBe("Falha ao votar");

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.moreError).toBe("Erro na página 2");
  });
});
