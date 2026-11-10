"use client";

import { formatRating } from "@/shared/lib/format";

export type StarRatingInputProps = {
  value: number | null;
  onChange: (rating: number) => void;
};

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  return (
    <div role="group" aria-label="Sua nota" className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const full = value !== null && value >= star;
        const half = value === star - 0.5;

        return (
          <span key={star} className="relative inline-flex h-11 w-9 items-center justify-center">
            <span aria-hidden="true" className="text-3xl leading-none text-subtle">
              ★
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden text-3xl leading-[2.75rem] text-secondary"
              style={{ width: full ? "100%" : half ? "50%" : "0%" }}
            >
              ★
            </span>
            <button
              type="button"
              aria-label={`${formatRating(star - 0.5)} de 5 estrelas`}
              aria-pressed={value === star - 0.5}
              onClick={() => onChange(star - 0.5)}
              className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer rounded-l focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
            />
            <button
              type="button"
              aria-label={`${formatRating(star)} de 5 estrelas`}
              aria-pressed={value === star}
              onClick={() => onChange(star)}
              className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer rounded-r focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
            />
          </span>
        );
      })}
      <span className="ml-2 min-w-14 text-sm font-medium text-secondary" aria-live="polite">
        {value === null ? "Sem nota" : `${formatRating(value)} / 5`}
      </span>
    </div>
  );
}