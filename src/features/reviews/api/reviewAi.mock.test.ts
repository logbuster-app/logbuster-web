import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchReviewSummaryMock } from "./reviewAi.mock";
import { resetMockReviews } from "./reviews.mock";

describe("reviewAi.mock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetMockReviews();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("gera o resumo para um filme com 3 ou mais avaliações", async () => {
    const pending = fetchReviewSummaryMock("tt0133093");
    await vi.runAllTimersAsync();
    const result = await pending;

    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.text.length).toBeGreaterThan(20);
      expect(Number.isNaN(new Date(result.generatedAt).getTime())).toBe(false);
    }
  });

  it("não gera o resumo para filme com menos de 3 avaliações", async () => {
    const pending = fetchReviewSummaryMock("tt9999999");
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toEqual({ status: "insufficient_reviews" });
  });
});
