"use client";

import { useState } from "react";

type Props = {
  initialValue?: string;
  onSearch: (query: string) => void;
};

export function SearchBar({ initialValue = "", onSearch }: Props) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    if (query) onSearch(query);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex max-w-2xl">
      <label htmlFor="movie-search" className="sr-only">
        Buscar filmes
      </label>
      <input
        id="movie-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Busque um filme pelo título"
        className="h-12 min-w-0 flex-1 rounded-card border-2 border-foreground bg-surface px-4 text-foreground placeholder:text-subtle"
      />
      <button
        type="submit"
        className="h-12 rounded-card bg-primary px-6 font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Buscar
      </button>
    </form>
  );
}
