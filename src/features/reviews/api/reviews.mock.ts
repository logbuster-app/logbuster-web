import type {
  CreateReviewInput,
  Review,
  ReviewInteraction,
  ReviewListPage,
  ReviewSort,
} from "../types";

export type InteractionToggleResult = {
  reviewId: string;
  type: ReviewInteraction;
  active: boolean;
  counts: Review["counts"];
  viewerInteractions: ReviewInteraction[];
};

export type ReviewCreationMockResponse = {
  id: string;
  movie_id: string;
  author_name: string;
  rating: number;
  content: string;
  is_spoiler: boolean;
  highlights: Review["highlights"];
  counts: {
    like: number;
    spoiler: number;
    well_argued: number;
  };
  viewer_interactions: ReviewInteraction[];
  created_at: string;
};

const INITIAL_MOCK_REVIEWS: Review[] = [
  {
    id: "c4f7d9d2-9d4e-4b3a-8f55-1f2e3d4c5b6a",
    movieId: "tt0133093",
    authorName: "Thyago",
    rating: 4.5,
    content:
      "Direção precisa e efeitos visuais que revolucionaram o gênero da ficção científica no cinema moderno.",
    isSpoiler: false,
    highlights: ["direction", "visual_effects"],
    counts: {
      like: 4,
      spoiler: 0,
      wellArgued: 9,
    },
    viewerInteractions: [],
    createdAt: "2026-11-08T18:30:00Z",
  },
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    movieId: "tt0133093",
    authorName: "Elton",
    rating: 5.0,
    content:
      "Uma obra-prima absoluta sobre simulação, livre-arbítrio e destino. No final Neo descobre a verdade sobre o Arquiteto e o ciclo da Matrix.",
    isSpoiler: false,
    highlights: ["screenplay", "acting"],
    counts: {
      like: 12,
      spoiler: 4, // spoiler >= 3 deve ativar proteção de spoiler
      wellArgued: 15,
    },
    viewerInteractions: [],
    createdAt: "2026-11-07T14:15:00Z",
  },
  {
    id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    movieId: "tt0133093",
    authorName: "Marcos",
    rating: 4.0,
    content:
      "A trilha sonora industrial casa perfeitamente com o ritmo e os tons esverdeados da cinematografia.",
    isSpoiler: false,
    highlights: ["soundtrack", "cinematography"],
    counts: {
      like: 8,
      spoiler: 0,
      wellArgued: 3,
    },
    viewerInteractions: [],
    createdAt: "2026-11-09T10:00:00Z",
  },
  {
    id: "f9e8d7c6-b5a4-3210-fedc-ba9876543210",
    movieId: "tt0133093",
    authorName: "Visitante Crítico",
    rating: 3.5,
    content:
      "Atenção ao clímax: a morte de Trinity é temporariamente evitada quando Neo manipula o código diretamente no coração dela.",
    isSpoiler: true, // flag is_spoiler explícita
    highlights: ["acting"],
    counts: {
      like: 1,
      spoiler: 1,
      wellArgued: 1,
    },
    viewerInteractions: [],
    createdAt: "2026-11-09T12:00:00Z",
  },
];

let mockReviews: Review[] = JSON.parse(JSON.stringify(INITIAL_MOCK_REVIEWS));
const activeInteractions = new Set<string>(); // chave: `${reviewId}:${visitorId}:${type}`

export function resetMockReviews(): void {
  mockReviews = JSON.parse(JSON.stringify(INITIAL_MOCK_REVIEWS));
  activeInteractions.clear();
}

export async function createReviewMock(
  input: CreateReviewInput,
): Promise<ReviewCreationMockResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response: ReviewCreationMockResponse = {
    id: crypto.randomUUID(),
    movie_id: input.movieId,
    author_name: input.authorName,
    rating: input.rating,
    content: input.content,
    is_spoiler: input.isSpoiler,
    highlights: [...input.highlights],
    counts: { like: 0, spoiler: 0, well_argued: 0 },
    viewer_interactions: [],
    created_at: new Date().toISOString(),
  };

  mockReviews = [
    {
      id: response.id,
      movieId: response.movie_id,
      authorName: response.author_name,
      rating: response.rating,
      content: response.content,
      isSpoiler: response.is_spoiler,
      highlights: response.highlights,
      counts: { like: 0, spoiler: 0, wellArgued: 0 },
      viewerInteractions: [],
      createdAt: response.created_at,
    },
    ...mockReviews,
  ];
  return response;
}

export async function fetchMovieRatingMock(movieId: string) {
  const reviews = mockReviews.filter((review) => review.movieId === movieId);
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : null;

  return {
    movieId,
    averageRating: average === null ? null : Math.round(average * 100) / 100,
    reviewsCount: reviews.length,
  };
}

function sortReviews(reviews: Review[], sort: ReviewSort): Review[] {
  const copy = [...reviews];
  switch (sort) {
    case "well_argued":
      return copy.sort(
        (a, b) =>
          b.counts.wellArgued - a.counts.wellArgued ||
          b.counts.like - a.counts.like ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "most_liked":
      return copy.sort(
        (a, b) =>
          b.counts.like - a.counts.like ||
          b.counts.wellArgued - a.counts.wellArgued ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "newest":
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "rating_desc":
      return copy.sort(
        (a, b) =>
          b.rating - a.rating ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "rating_asc":
      return copy.sort(
        (a, b) =>
          a.rating - b.rating ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

export async function fetchReviewsMock(
  movieId: string,
  options?: {
    sort?: ReviewSort;
    page?: number;
    pageSize?: number;
    visitorId?: string;
  },
): Promise<ReviewListPage> {
  const sort = options?.sort ?? "well_argued";
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const visitorId = options?.visitorId;

  // Filtra por filme. Se não encontrar para o ID solicitado, mas for teste, podemos ter avaliações
  const filtered = mockReviews.filter((r) => r.movieId === movieId);

  const decorated = filtered.map((review) => {
    const viewerInteractions: ReviewInteraction[] = [];
    if (visitorId) {
      (["like", "spoiler", "well_argued"] as const).forEach((t) => {
        if (activeInteractions.has(`${review.id}:${visitorId}:${t}`)) {
          viewerInteractions.push(t);
        }
      });
    }
    return {
      ...review,
      viewerInteractions,
    };
  });

  const sorted = sortReviews(decorated, sort);
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  return {
    items: paginated,
    total: filtered.length,
    page,
    pageSize,
    sort,
  };
}

export async function toggleInteractionMock(
  reviewId: string,
  type: ReviewInteraction,
  visitorId: string,
): Promise<InteractionToggleResult> {
  const review = mockReviews.find((r) => r.id === reviewId);
  if (!review) {
    throw new Error("Avaliação não encontrada");
  }

  const key = `${reviewId}:${visitorId}:${type}`;
  const alreadyActive = activeInteractions.has(key);

  let active = false;
  if (alreadyActive) {
    activeInteractions.delete(key);
    active = false;
    if (type === "like") review.counts.like = Math.max(0, review.counts.like - 1);
    if (type === "spoiler")
      review.counts.spoiler = Math.max(0, review.counts.spoiler - 1);
    if (type === "well_argued")
      review.counts.wellArgued = Math.max(0, review.counts.wellArgued - 1);
  } else {
    activeInteractions.add(key);
    active = true;
    if (type === "like") review.counts.like += 1;
    if (type === "spoiler") review.counts.spoiler += 1;
    if (type === "well_argued") review.counts.wellArgued += 1;
  }

  const viewerInteractions: ReviewInteraction[] = [];
  (["like", "spoiler", "well_argued"] as const).forEach((t) => {
    if (activeInteractions.has(`${reviewId}:${visitorId}:${t}`)) {
      viewerInteractions.push(t);
    }
  });

  return {
    reviewId,
    type,
    active,
    counts: { ...review.counts },
    viewerInteractions,
  };
}
