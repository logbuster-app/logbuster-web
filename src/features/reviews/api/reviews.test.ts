import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/lib/errors";

const envMock = vi.hoisted(() => ({
  apiBaseUrl: "http://localhost:8000",
  useApiMocks: false,
}));
vi.mock("@/shared/config/env", () => ({ env: envMock }));

import {
  type BackendReviewItem,
  fetchMovieReviews,
  toReview,
  toggleReviewInteraction,
} from "./reviews";
import * as reviewsMockModule from "./reviews.mock";

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("toReview", () => {
  it("converte o payload snake_case do backend para a entidade de domínio camelCase", () => {
    const raw: BackendReviewItem = {
      id: "c4f7d9d2-9d4e-4b3a-8f55-1f2e3d4c5b6a",
      movie_id: "tt0133093",
      author_name: "Thyago",
      rating: 4.5,
      content: "Excelente direção e efeitos inovadores.",
      is_spoiler: false,
      highlights: ["direction", "visual_effects"],
      counts: {
        like: 4,
        spoiler: 0,
        well_argued: 9,
      },
      viewer_interactions: ["well_argued"],
      created_at: "2026-11-08T18:30:00Z",
    };

    const review = toReview(raw);

    expect(review).toEqual({
      id: "c4f7d9d2-9d4e-4b3a-8f55-1f2e3d4c5b6a",
      movieId: "tt0133093",
      authorName: "Thyago",
      rating: 4.5,
      content: "Excelente direção e efeitos inovadores.",
      isSpoiler: false,
      highlights: ["direction", "visual_effects"],
      counts: {
        like: 4,
        spoiler: 0,
        wellArgued: 9,
      },
      viewerInteractions: ["well_argued"],
      createdAt: "2026-11-08T18:30:00Z",
    });
  });
});

describe("fetchMovieReviews", () => {
  beforeEach(() => {
    envMock.useApiMocks = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("chama o endpoint GET /api/v1/movies/{id}/reviews com query params e header X-Visitor-Id", async () => {
    const fetchMock = mockFetch({
      items: [
        {
          id: "r1",
          movie_id: "tt0133093",
          author_name: "Elton",
          rating: 5.0,
          content: "Obra-prima.",
          is_spoiler: false,
          highlights: ["screenplay"],
          counts: { like: 10, spoiler: 0, well_argued: 15 },
          viewer_interactions: ["well_argued"],
          created_at: "2026-11-08T10:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      page_size: 10,
      sort: "well_argued",
    });

    const result = await fetchMovieReviews("tt0133093", {
      sort: "well_argued",
      page: 1,
      pageSize: 10,
      visitorId: "v-123",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [urlArg, initArg] = fetchMock.mock.calls[0];
    const url = new URL(urlArg);
    expect(url.pathname).toBe("/api/v1/movies/tt0133093/reviews");
    expect(url.searchParams.get("sort")).toBe("well_argued");
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.get("page_size")).toBe("10");
    expect(initArg.headers["X-Visitor-Id"]).toBe("v-123");

    expect(result.items).toHaveLength(1);
    expect(result.items[0].authorName).toBe("Elton");
    expect(result.items[0].counts.wellArgued).toBe(15);
  });

  it("retorna lista vazia quando o backend responde 404", async () => {
    mockFetch({}, { ok: false, status: 404 });

    const result = await fetchMovieReviews("tt9999999");
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("lança ApiError quando o backend retorna status de erro 500", async () => {
    mockFetch({}, { ok: false, status: 500 });

    await expect(fetchMovieReviews("tt0133093")).rejects.toBeInstanceOf(ApiError);
  });

  it("lança ApiError em falha de rede", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(fetchMovieReviews("tt0133093")).rejects.toMatchObject({
      code: "network",
    });
  });

  it("delega para reviews.mock.ts quando env.useApiMocks for true", async () => {
    envMock.useApiMocks = true;
    const spy = vi.spyOn(reviewsMockModule, "fetchReviewsMock").mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      sort: "well_argued",
    });

    const result = await fetchMovieReviews("tt0133093");
    expect(spy).toHaveBeenCalledWith("tt0133093", undefined);
    expect(result.total).toBe(0);
  });
});

describe("toggleReviewInteraction", () => {
  beforeEach(() => {
    envMock.useApiMocks = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envia POST /api/v1/reviews/{id}/interactions com body { type } e header X-Visitor-Id", async () => {
    const fetchMock = mockFetch({
      review_id: "r1",
      type: "well_argued",
      active: true,
      counts: {
        like: 5,
        spoiler: 0,
        well_argued: 11,
      },
      viewer_interactions: ["well_argued"],
    });

    const result = await toggleReviewInteraction(
      "r1",
      "well_argued",
      "visitor-uuid-123",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [urlArg, initArg] = fetchMock.mock.calls[0];
    const url = new URL(urlArg);
    expect(url.pathname).toBe("/api/v1/reviews/r1/interactions");
    expect(initArg.method).toBe("POST");
    expect(initArg.headers["X-Visitor-Id"]).toBe("visitor-uuid-123");
    expect(initArg.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(initArg.body)).toEqual({ type: "well_argued" });

    expect(result.active).toBe(true);
    expect(result.counts.wellArgued).toBe(11);
    expect(result.viewerInteractions).toEqual(["well_argued"]);
  });

  it("lança ApiError em erro do backend", async () => {
    mockFetch({}, { ok: false, status: 400 });

    await expect(
      toggleReviewInteraction("r1", "well_argued", "v1"),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("lança ApiError em falha de rede", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network error")));

    await expect(
      toggleReviewInteraction("r1", "well_argued", "v1"),
    ).rejects.toMatchObject({
      code: "network",
    });
  });

  it("delega para reviews.mock.ts quando env.useApiMocks for true", async () => {
    envMock.useApiMocks = true;
    const spy = vi
      .spyOn(reviewsMockModule, "toggleInteractionMock")
      .mockResolvedValueOnce({
        reviewId: "r1",
        type: "like",
        active: true,
        counts: { like: 1, spoiler: 0, wellArgued: 0 },
        viewerInteractions: ["like"],
      });

    const result = await toggleReviewInteraction("r1", "like", "v1");
    expect(spy).toHaveBeenCalledWith("r1", "like", "v1");
    expect(result.active).toBe(true);
  });
});
