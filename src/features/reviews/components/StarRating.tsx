import React from "react";
import { StarIcon } from "./StarIcon";

export function StarRating({ rating }: { rating: number }) {
  const clampedRating = Math.max(0.5, Math.min(5.0, rating));
  const formatted = clampedRating.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  // Gera as 5 estrelas: cheia, meia ou vazia
  const stars = [1, 2, 3, 4, 5].map((starIndex) => {
    const diff = clampedRating - (starIndex - 1);
    if (diff >= 1) {
      return "full";
    }
    if (diff >= 0.5) {
      return "half";
    }
    return "empty";
  });

  return (
    <div
      className="inline-flex items-center gap-2"
      aria-label={`Nota: ${formatted} de 5 estrelas`}
    >
      <div className="flex items-center gap-0.5 text-secondary" aria-hidden="true">
        {stars.map((type, i) => (
          <span key={i} className="relative inline-flex size-5">
            <StarIcon className="size-5 text-subtle" />
            {type !== "empty" ? (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: type === "full" ? "100%" : "50%" }}
              >
                <StarIcon filled className="size-5 text-secondary" />
              </span>
            ) : null}
          </span>
        ))}
      </div>
      <span className="text-sm font-bold text-secondary">
        {formatted} <span className="font-normal text-muted">/ 5</span>
      </span>
    </div>
  );
}
