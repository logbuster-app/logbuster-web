"use client";

import { formatRating } from "@/shared/lib/format";
import { StarIcon } from "./StarIcon";

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
          <span key={star} className="relative inline-flex h-11 w-10 items-center justify-center">
            <StarIcon className="size-8 text-subtle" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center overflow-hidden"
              style={{ width: full ? "100%" : half ? "50%" : "0%" }}
            >
              <StarIcon filled className="size-8 shrink-0 text-secondary" />
            </span>
            <button
              type="button"
              aria-label={`${formatRating(star - 0.5)} de 5 estrelas`}
              aria-pressed={value === star - 0.5}
              onClick={() => onChange(star - 0.5)}
              className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer"
            />
            <button
              type="button"
              aria-label={`${formatRating(star)} de 5 estrelas`}
              aria-pressed={value === star}
              onClick={() => onChange(star)}
              className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer"
            />
          </span>
        );
      })}
      <span className="ml-2 min-w-16 text-sm font-bold text-secondary" aria-live="polite">
        {value === null ? "Sem nota" : `${formatRating(value)} / 5`}
      </span>
    </div>
  );
}