import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Review } from "../types";
import { useUserReviewsAll } from "./useUserReviewsAll";

const mockFetchUserReviews = vi.fn();

vi.mock("../api/reviews", () => ({
  fetchUserReviews: (...args: unknown[]) => mockFetchUserReviews(...args),
}));

function makeBatch(start: number, count: number): Review[] {
  return Array.from({ length: count }, (_, idx) => {
    const num = start + idx;
    return {
      id: `r-${num}`,
      movieId: `tt${String(num).padStart(7, "0")}`,
      authorName: "Helena",
      rating: 4.0,
      content: "Análise de teste.",
      isSpoiler: false,
      highlights: [],
      counts: { like: 0, spoiler: 0, wellArgued: 0 },
      viewerInteractions: [],
      createdAt: "2026-11-20T12:00:00Z",
    };
  });
}

afterEach(() => {
  mockFetchUserReviews.mockReset();
});

describe("useUserReviewsAll", () => {
  it("percorre páginas com page_size=50 e respeita o teto de 4 páginas (200 avaliações)", async () => {
    mockFetchUserReviews
      .mockResolvedValueOnce({ items: makeBatch(1, 50), total: 260, page: 1, pageSize: 50 })
      .mockResolvedValueOnce({ items: makeBatch(51, 50), total: 260, page: 2, pageSize: 50 })
      .mockResolvedValueOnce({ items: makeBatch(101, 50), total: 260, page: 3, pageSize: 50 })
      .mockResolvedValueOnce({ items: makeBatch(151, 50), total: 260, page: 4, pageSize: 50 });

    const { result } = renderHook(() => useUserReviewsAll("user-260"));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(mockFetchUserReviews).toHaveBeenCalledTimes(4);
    expect(mockFetchUserReviews.mock.calls[0][1]).toEqual({ page: 1, pageSize: 50 });
    expect(mockFetchUserReviews.mock.calls[3][1]).toEqual({ page: 4, pageSize: 50 });
    expect(result.current.reviews).toHaveLength(200);
    expect(result.current.total).toBe(260);
  });

  it("interrompe assim que alcança o total e expõe erro em caso de falha", async () => {
    mockFetchUserReviews.mockResolvedValueOnce({
      items: makeBatch(1, 4),
      total: 4,
      page: 1,
      pageSize: 50,
    });

    const { result } = renderHook(() => useUserReviewsAll("user-4"));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(mockFetchUserReviews).toHaveBeenCalledTimes(1);
    expect(result.current.reviews).toHaveLength(4);

    mockFetchUserReviews.mockRejectedValueOnce(new Error("Falha ao buscar histórico"));
    const { result: errResult } = renderHook(() => useUserReviewsAll("user-err"));
    await waitFor(() => expect(errResult.current.status).toBe("error"));
    expect(errResult.current.error).toBe("Falha ao buscar histórico");
  });
});
