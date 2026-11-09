import { beforeEach, describe, expect, it } from "vitest";
import {
  fetchReviewsMock,
  resetMockReviews,
  toggleInteractionMock,
} from "./reviews.mock";

describe("reviews.mock", () => {
  const movieId = "tt0133093";
  const visitorId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    resetMockReviews();
  });

  it("ordena por padrão pelas Mais bem argumentadas (well_argued)", async () => {
    const page = await fetchReviewsMock(movieId);
    expect(page.sort).toBe("well_argued");
    expect(page.items.length).toBeGreaterThanOrEqual(2);

    // O primeiro item deve ter maior ou igual wellArgued que o segundo
    for (let i = 0; i < page.items.length - 1; i++) {
      expect(page.items[i].counts.wellArgued).toBeGreaterThanOrEqual(
        page.items[i + 1].counts.wellArgued,
      );
    }
  });

  it("ordena por Mais curtidas (most_liked)", async () => {
    const page = await fetchReviewsMock(movieId, { sort: "most_liked" });
    expect(page.sort).toBe("most_liked");

    for (let i = 0; i < page.items.length - 1; i++) {
      expect(page.items[i].counts.like).toBeGreaterThanOrEqual(
        page.items[i + 1].counts.like,
      );
    }
  });

  it("ordena por Mais recentes (newest)", async () => {
    const page = await fetchReviewsMock(movieId, { sort: "newest" });
    expect(page.sort).toBe("newest");

    for (let i = 0; i < page.items.length - 1; i++) {
      const dateA = new Date(page.items[i].createdAt).getTime();
      const dateB = new Date(page.items[i + 1].createdAt).getTime();
      expect(dateA).toBeGreaterThanOrEqual(dateB);
    }
  });

  it("ordena por Maior nota (rating_desc) e Menor nota (rating_asc)", async () => {
    const descPage = await fetchReviewsMock(movieId, { sort: "rating_desc" });
    for (let i = 0; i < descPage.items.length - 1; i++) {
      expect(descPage.items[i].rating).toBeGreaterThanOrEqual(
        descPage.items[i + 1].rating,
      );
    }

    const ascPage = await fetchReviewsMock(movieId, { sort: "rating_asc" });
    for (let i = 0; i < ascPage.items.length - 1; i++) {
      expect(ascPage.items[i].rating).toBeLessThanOrEqual(
        ascPage.items[i + 1].rating,
      );
    }
  });

  it("permite paginação com limit e offset", async () => {
    const page = await fetchReviewsMock(movieId, { page: 1, pageSize: 2 });
    expect(page.items.length).toBe(2);
    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(2);
    expect(page.total).toBe(4);
  });

  it("faz toggle de interação: adiciona no primeiro clique e remove no segundo", async () => {
    const initialPage = await fetchReviewsMock(movieId);
    const targetReview = initialPage.items[0];
    const initialWellArgued = targetReview.counts.wellArgued;

    // Primeiro clique: adiciona
    const firstToggle = await toggleInteractionMock(
      targetReview.id,
      "well_argued",
      visitorId,
    );
    expect(firstToggle.active).toBe(true);
    expect(firstToggle.counts.wellArgued).toBe(initialWellArgued + 1);
    expect(firstToggle.viewerInteractions).toContain("well_argued");

    // Segundo clique: remove (toggle)
    const secondToggle = await toggleInteractionMock(
      targetReview.id,
      "well_argued",
      visitorId,
    );
    expect(secondToggle.active).toBe(false);
    expect(secondToggle.counts.wellArgued).toBe(initialWellArgued);
    expect(secondToggle.viewerInteractions).not.toContain("well_argued");
  });

  it("mantém tipos de interação independentes para o mesmo visitante", async () => {
    const initialPage = await fetchReviewsMock(movieId);
    const targetReview = initialPage.items[0];

    await toggleInteractionMock(targetReview.id, "well_argued", visitorId);
    const likeToggle = await toggleInteractionMock(
      targetReview.id,
      "like",
      visitorId,
    );

    expect(likeToggle.viewerInteractions).toContain("well_argued");
    expect(likeToggle.viewerInteractions).toContain("like");
  });

  it("lança erro ao tentar interagir com review inexistente", async () => {
    await expect(
      toggleInteractionMock("inexistente-id", "like", visitorId),
    ).rejects.toThrow("Avaliação não encontrada");
  });
});
