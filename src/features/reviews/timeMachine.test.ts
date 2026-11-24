import { describe, expect, it } from "vitest";
import { computeTimeMachine } from "./timeMachine";
import type { Review, ReviewHighlight } from "./types";

function makeReview(
  overrides: Partial<Review> & { id: string; movieId: string; rating: number },
): Review {
  const { id, movieId, rating, ...rest } = overrides;
  return {
    id,
    movieId,
    authorName: "Helena",
    rating,
    content: "Texto ignorado pela retrospectiva.",
    isSpoiler: false,
    highlights: [] as ReviewHighlight[],
    counts: { like: 0, spoiler: 0, wellArgued: 0 },
    viewerInteractions: [],
    createdAt: "2026-11-10T12:00:00Z",
    ...rest,
  };
}

describe("computeTimeMachine", () => {
  it("retorna null quando há menos de 3 avaliações", () => {
    expect(computeTimeMachine([])).toBeNull();
    expect(
      computeTimeMachine([
        makeReview({ id: "1", movieId: "tt0000001", rating: 4.0 }),
        makeReview({ id: "2", movieId: "tt0000002", rating: 5.0 }),
      ]),
    ).toBeNull();
  });

  it("calcula filmes distintos, média com 1 casa, destaque líder e filme mais amado", () => {
    const reviews: Review[] = [
      makeReview({
        id: "1",
        movieId: "tt0000001",
        rating: 4.0,
        highlights: ["cinematography", "direction"],
        createdAt: "2026-11-20T10:00:00Z",
      }),
      makeReview({
        id: "2",
        movieId: "tt0000001", // mesmo filme avaliado duas vezes
        rating: 4.5,
        highlights: ["cinematography"],
        createdAt: "2026-11-19T10:00:00Z",
      }),
      makeReview({
        id: "3",
        movieId: "tt0000002",
        rating: 5.0,
        highlights: ["acting"],
        createdAt: "2026-11-18T10:00:00Z",
      }),
      makeReview({
        id: "4",
        movieId: "tt0000003",
        rating: 3.5,
        highlights: ["cinematography"],
        createdAt: "2026-11-17T10:00:00Z",
      }),
    ];

    expect(computeTimeMachine(reviews)).toEqual({
      ratedMoviesCount: 3,
      ratingAvg: 4.3, // (4 + 4.5 + 5 + 3.5) / 4 = 4.25 -> 4.3
      topHighlight: { highlight: "cinematography", count: 3 },
      topMovie: { movieId: "tt0000002", rating: 5.0 },
    });
  });

  it("desempata o filme mais amado pela avaliação mais recente e o destaque pela ordem oficial", () => {
    const reviews: Review[] = [
      makeReview({
        id: "antiga",
        movieId: "tt0000001",
        rating: 5.0,
        highlights: ["visual_effects", "direction"],
        createdAt: "2026-11-10T10:00:00Z",
      }),
      makeReview({
        id: "recente",
        movieId: "tt0000002",
        rating: 5.0,
        highlights: ["cinematography", "acting"],
        createdAt: "2026-11-22T15:00:00Z",
      }),
      makeReview({
        id: "meio",
        movieId: "tt0000003",
        rating: 3.0,
        highlights: ["direction", "cinematography"],
        createdAt: "2026-11-15T12:00:00Z",
      }),
    ];

    // cinematography (2) empata com direction (2); na ordem oficial cinematography vem antes
    // nota 5.0 empata entre tt0000001 (10/11) e tt0000002 (22/11); vence tt0000002 (mais recente)
    expect(computeTimeMachine(reviews)).toEqual({
      ratedMoviesCount: 3,
      ratingAvg: 4.3,
      topHighlight: { highlight: "cinematography", count: 2 },
      topMovie: { movieId: "tt0000002", rating: 5.0 },
    });
  });

  it("retorna topHighlight nulo quando nenhuma avaliação possui destaques", () => {
    const reviews: Review[] = [
      makeReview({ id: "1", movieId: "tt0000001", rating: 4.0, highlights: [] }),
      makeReview({ id: "2", movieId: "tt0000002", rating: 4.0, highlights: [] }),
      makeReview({ id: "3", movieId: "tt0000003", rating: 4.0, highlights: [] }),
    ];

    const stats = computeTimeMachine(reviews);
    expect(stats?.topHighlight).toBeNull();
    expect(stats?.ratedMoviesCount).toBe(3);
  });
});
