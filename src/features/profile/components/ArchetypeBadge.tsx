import type { Archetype } from "../types";

export type ArchetypeBadgeProps = {
  archetype: Archetype | null;
};

/**
 * Bloco público do arquétipo do cinéfilo (SPEC-FRONT-09 RN-06/07, SPEC-UI-01 §6.7).
 * Segue a linguagem de bloco osso da Nota LogBuster.
 */
export function ArchetypeBadge({ archetype }: ArchetypeBadgeProps) {
  if (!archetype) {
    return (
      <p className="text-sm text-muted">
        O arquétipo aparece a partir de 3 avaliações.
      </p>
    );
  }

  return (
    <div className="inline-flex max-w-full flex-col rounded-card border-2 border-foreground bg-foreground text-background sm:flex-row sm:items-stretch">
      <div className="flex flex-col justify-center gap-0.5 px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-wide">
          Arquétipo do cinéfilo
        </span>
        <span className="font-display text-3xl sm:text-4xl">
          {archetype.title}
        </span>
      </div>
      <div className="flex items-center border-t-2 border-background px-4 py-3 text-sm font-medium sm:max-w-md sm:border-t-0 sm:border-l-2">
        {archetype.description}
      </div>
    </div>
  );
}
