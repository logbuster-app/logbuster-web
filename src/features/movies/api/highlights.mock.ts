import type { Highlight } from "@/shared/lib/highlights";
import type { HighlightedMovie } from "../types";

const MOCK_DELAY_MS = 350;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function movie(
  id: string,
  title: string,
  year: string,
  highlightCount: number,
  ratingAvg: number,
  ratingCount: number,
): HighlightedMovie {
  return { id, title, year, posterUrl: null, ratingAvg, ratingCount, highlightCount };
}

/**
 * Rankings de demonstração, já na ordem do backend (contagem, depois nota).
 * Trilha Sonora fica vazia de propósito: mostra que o padrão é o primeiro aspecto com filmes.
 * Efeitos Especiais tem mais de 10 itens para mostrar o limite da grade.
 */
const MOCK_RANKINGS: Record<Highlight, HighlightedMovie[]> = {
  soundtrack: [],
  cinematography: [
    movie("tt0468569", "Batman: O Cavaleiro das Trevas", "2008", 9, 4.8, 12),
    movie("tt0816692", "Interestelar", "2014", 7, 4.6, 9),
    movie("tt1375666", "A Origem", "2010", 5, 4.5, 8),
    movie("tt0133093", "Matrix", "1999", 4, 4.4, 10),
    movie("tt0110912", "Pulp Fiction", "1994", 2, 4.7, 6),
  ],
  screenplay: [
    movie("tt0110912", "Pulp Fiction", "1994", 8, 4.7, 6),
    movie("tt0137523", "Clube da Luta", "1999", 6, 4.6, 7),
    movie("tt0114369", "Se7en", "1995", 5, 4.5, 5),
    movie("tt1375666", "A Origem", "2010", 4, 4.5, 8),
    movie("tt0068646", "O Poderoso Chefão", "1972", 3, 4.9, 4),
    movie("tt0109830", "Forrest Gump", "1994", 2, 4.3, 5),
  ],
  acting: [
    movie("tt0068646", "O Poderoso Chefão", "1972", 11, 4.9, 4),
    movie("tt0468569", "Batman: O Cavaleiro das Trevas", "2008", 10, 4.8, 12),
    movie("tt0137523", "Clube da Luta", "1999", 8, 4.6, 7),
    movie("tt0109830", "Forrest Gump", "1994", 7, 4.3, 5),
    movie("tt0110912", "Pulp Fiction", "1994", 6, 4.7, 6),
    movie("tt0114369", "Se7en", "1995", 5, 4.5, 5),
  ],
  direction: [
    movie("tt0068646", "O Poderoso Chefão", "1972", 6, 4.9, 4),
    movie("tt0110912", "Pulp Fiction", "1994", 5, 4.7, 6),
    movie("tt0120737", "O Senhor dos Anéis: A Sociedade do Anel", "2001", 3, 4.4, 4),
  ],
  visual_effects: [
    movie("tt0133093", "Matrix", "1999", 12, 4.4, 10),
    movie("tt0816692", "Interestelar", "2014", 11, 4.6, 9),
    movie("tt1375666", "A Origem", "2010", 10, 4.5, 8),
    movie("tt0468569", "Batman: O Cavaleiro das Trevas", "2008", 9, 4.8, 12),
    movie("tt0120737", "O Senhor dos Anéis: A Sociedade do Anel", "2001", 8, 4.4, 4),
    movie("tt0137523", "Clube da Luta", "1999", 7, 4.6, 7),
    movie("tt0114369", "Se7en", "1995", 6, 4.5, 5),
    movie("tt0109830", "Forrest Gump", "1994", 5, 4.3, 5),
    movie("tt0110912", "Pulp Fiction", "1994", 4, 4.7, 6),
    movie("tt0068646", "O Poderoso Chefão", "1972", 3, 4.9, 4),
    movie("tt0133094", "Filme Extra", "2000", 2, 3.5, 2),
  ],
};

/** Simula o backend (`NEXT_PUBLIC_USE_API_MOCKS=true`): ranking por aspecto, respeitando o limite. */
export async function fetchHighlightedMoviesMock(
  highlight: Highlight,
  limit: number,
): Promise<HighlightedMovie[]> {
  await wait(MOCK_DELAY_MS);
  return MOCK_RANKINGS[highlight].slice(0, limit).map((item) => ({ ...item }));
}
