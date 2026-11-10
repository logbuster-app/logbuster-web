"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type MovieRatingSummary = {
  movieId: string;
  averageRating: number | null;
  reviewsCount: number;
};

type MovieRatingContextValue = {
  rating: MovieRatingSummary | null;
  updateRating: (rating: MovieRatingSummary) => void;
};

const MovieRatingContext = createContext<MovieRatingContextValue | null>(null);

export function MovieRatingProvider({ children }: { children: ReactNode }) {
  const [rating, setRating] = useState<MovieRatingSummary | null>(null);
  const updateRating = useCallback((nextRating: MovieRatingSummary) => {
    setRating(nextRating);
  }, []);

  return (
    <MovieRatingContext.Provider value={{ rating, updateRating }}>
      {children}
    </MovieRatingContext.Provider>
  );
}

export function useMovieRatingContext() {
  return useContext(MovieRatingContext);
}