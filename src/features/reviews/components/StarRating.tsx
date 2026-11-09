import React from "react";

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
      className="inline-flex items-center gap-1.5"
      aria-label={`Nota: ${formatted} de 5 estrelas`}
    >
      <div className="flex items-center gap-0.5 text-secondary" aria-hidden="true">
        {stars.map((type, i) => (
          <span key={i} className="text-base leading-none">
            {type === "full" && "★"}
            {type === "half" && "⯨"}
            {type === "empty" && <span className="text-subtle">☆</span>}
          </span>
        ))}
      </div>
      <span className="text-xs font-semibold text-secondary">
        {formatted} <span className="font-normal text-muted">/ 5</span>
      </span>
    </div>
  );
}
