import { HIGHLIGHTS, HIGHLIGHT_LABELS, type Highlight } from "@/shared/lib/highlights";

export type HighlightChipsProps = {
  /** Aspecto selecionado; `null` só enquanto o padrão ainda é descoberto. */
  selected: Highlight | null;
  onSelect: (highlight: Highlight) => void;
};

/**
 * Seis chips na ordem oficial, com um sempre selecionado. São rádios nativos:
 * Tab entra no grupo e as setas trocam de aspecto, sem JavaScript extra.
 * Quebram de linha, então a página nunca rola na horizontal.
 */
export function HighlightChips({ selected, onSelect }: HighlightChipsProps) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">Aspecto do filme</legend>
      <div className="flex flex-wrap gap-2">
        {HIGHLIGHTS.map((highlight) => (
          <label key={highlight} className="relative">
            <input
              type="radio"
              name="highlight"
              value={highlight}
              checked={selected === highlight}
              onChange={() => onSelect(highlight)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-11 cursor-pointer items-center rounded-card border-2 border-border px-4 text-sm font-bold uppercase tracking-wide text-muted transition-colors hover:border-foreground hover:text-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-text">
              {HIGHLIGHT_LABELS[highlight]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
