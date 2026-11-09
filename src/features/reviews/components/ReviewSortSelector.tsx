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
      <label htmlFor="review-sort-select" className="text-muted font-medium shrink-0">
        Ordenar por:
      </label>
      <select
        id="review-sort-select"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as ReviewSort)}
        className="h-9 rounded-card border border-border bg-surface px-3 py-1 text-xs sm:text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text disabled:opacity-50 cursor-pointer"
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
