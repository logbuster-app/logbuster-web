"use client";

import {
  REVIEW_HIGHLIGHT_LABELS,
  type ReviewHighlight,
} from "../types";

const highlights = Object.keys(REVIEW_HIGHLIGHT_LABELS) as ReviewHighlight[];

export type HighlightPickerProps = {
  value: ReviewHighlight[];
  onChange: (highlights: ReviewHighlight[]) => void;
};

export function HighlightPicker({ value, onChange }: HighlightPickerProps) {
  function toggle(highlight: ReviewHighlight) {
    if (value.includes(highlight)) {
      onChange(value.filter((item) => item !== highlight));
      return;
    }
    if (value.length < 2) onChange([...value, highlight]);
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-bold uppercase tracking-wide text-foreground">
        Pontos de destaque <span className="text-muted">(opcional, até 2)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {highlights.map((highlight) => {
          const selected = value.includes(highlight);
          const disabled = value.length >= 2 && !selected;

          return (
            <button
              key={highlight}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => toggle(highlight)}
              className={`min-h-11 cursor-pointer rounded-card border-2 px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted hover:border-foreground hover:text-foreground"
              }`}
            >
              {REVIEW_HIGHLIGHT_LABELS[highlight]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}