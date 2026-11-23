/**
 * Pontos de destaque de uma avaliação (RN-04). São os mesmos seis valores do backend
 * (`domain/enums.py`) e servem tanto para avaliar (feature `reviews`) quanto para
 * descobrir filmes (feature `movies`), por isso ficam em `shared`.
 */
export type Highlight =
  | "soundtrack"
  | "cinematography"
  | "screenplay"
  | "acting"
  | "direction"
  | "visual_effects";

/** Ordem oficial dos destaques: a mesma do backend, do seletor do modal e dos chips da home. */
export const HIGHLIGHTS: readonly Highlight[] = [
  "soundtrack",
  "cinematography",
  "screenplay",
  "acting",
  "direction",
  "visual_effects",
];

export const HIGHLIGHT_LABELS: Record<Highlight, string> = {
  soundtrack: "Trilha Sonora",
  cinematography: "Fotografia",
  screenplay: "Roteiro",
  acting: "Atuação",
  direction: "Direção",
  visual_effects: "Efeitos Especiais",
};

/** Valida um valor vindo de fora (ex.: `?destaque=` na URL). */
export function isHighlight(value: unknown): value is Highlight {
  return typeof value === "string" && (HIGHLIGHTS as readonly string[]).includes(value);
}
