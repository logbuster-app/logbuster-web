"use client";

import React from "react";
import { REVIEW_SORT_OPTIONS, type ReviewSort } from "../types";

export type ReviewSortSelectorProps = {
  value: ReviewSort;
  onChange: (sort: ReviewSort) => void;
  disabled?: boolean;
};

export function ReviewSortSelector({
  value,
  onChange,
  disabled = false,
}: ReviewSortSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="review-sort-select" className="shrink-0 text-xs font-bold uppercase tracking-wide text-muted">
        Ordenar por:
      </label>
      <select
        id="review-sort-select"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as ReviewSort)}
        className="h-12 cursor-pointer rounded-card border-2 border-foreground bg-surface px-3 text-sm font-bold text-foreground transition-colors disabled:opacity-50"
      >
        {REVIEW_SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
