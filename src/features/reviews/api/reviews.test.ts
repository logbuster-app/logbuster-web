import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/lib/errors";

const envMock = vi.hoisted(() => ({
  apiBaseUrl: "http://localhost:8000",
  useApiMocks: false,
}));
vi.mock("@/shared/config/env", () => ({ env: envMock }));

import {
  type BackendReviewItem,
  createReview,
  fetchMovieRating,
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

describe("createReview (mock-first)", () => {
  beforeEach(() => {
    envMock.useApiMocks = true;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("delegates creation to reviews.mock.ts without making a network request", async () => {
    const input = {
      movieId: "tt0133093",
      authorName: "Thyago",
      rating: 4.5,
      content: "Análise válida com pelo menos dez caracteres.",
      isSpoiler: false,
      highlights: ["direction", "visual_effects"] as (
        | "direction"
        | "visual_effects"
      )[],
    };
    const spy = vi.spyOn(reviewsMockModule, "createReviewMock").mockResolvedValueOnce({
      id: "review-mock",
      movie_id: input.movieId,
      author_name: input.authorName,
      rating: input.rating,
      content: input.content,
      is_spoiler: input.isSpoiler,
      highlights: [...input.highlights],
      counts: { like: 0, spoiler: 0, well_argued: 0 },
      viewer_interactions: [],
      created_at: "2026-11-09T12:00:00Z",
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(createReview(input)).resolves.toMatchObject({
      id: "review-mock",
      movieId: input.movieId,
      authorName: input.authorName,
      createdAt: "2026-11-09T12:00:00Z",
    });
    expect(spy).toHaveBeenCalledWith(input);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envia POST com payload snake_case e converte a resposta 201", async () => {
    envMock.useApiMocks = false;
    const input = {
      movieId: "tt0133093",
      authorName: "Thyago",
      rating: 4.5,
      content: "Análise válida com pelo menos dez caracteres.",
      isSpoiler: false,
      highlights: [],
    };
    const fetchMock = mockFetch(
      {
        id: "review-1",
        movie_id: input.movieId,
        author_name: input.authorName,
        rating: input.rating,
        content: input.content,
        is_spoiler: false,
        highlights: [],
        counts: { like: 0, spoiler: 0, well_argued: 0 },
        viewer_interactions: [],
        created_at: "2026-11-09T12:00:00Z",
      },
      { status: 201 },
    );

    const review = await createReview(input);

    const [urlArg, initArg] = fetchMock.mock.calls[0];
    expect(new URL(urlArg).pathname).toBe("/api/v1/reviews");
    expect(initArg.method).toBe("POST");
    expect(JSON.parse(initArg.body)).toEqual({
      movie_id: input.movieId,
      author_name: input.authorName,
      rating: input.rating,
      content: input.content,
      is_spoiler: false,
      highlights: [],
    });
    expect(review).toMatchObject({ movieId: input.movieId, authorName: input.authorName });
  });
});

describe("fetchMovieRating", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("consulta a média agregada e converte a resposta do backend", async () => {
    envMock.useApiMocks = false;
    const fetchMock = mockFetch({
      movie_id: "tt0133093",
      rating_avg: 4.67,
      rating_count: 3,
    });

    await expect(fetchMovieRating("tt0133093")).resolves.toEqual({
      movieId: "tt0133093",
      averageRating: 4.67,
      reviewsCount: 3,
    });
    expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe(
      "/api/v1/movies/tt0133093/rating",
    );
  });

  it("calcula a média mockada incluindo todas as avaliações", async () => {
    envMock.useApiMocks = true;
    await expect(fetchMovieRating("tt0133093")).resolves.toEqual({
      movieId: "tt0133093",
      averageRating: 4.25,
      reviewsCount: 4,
    });
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
