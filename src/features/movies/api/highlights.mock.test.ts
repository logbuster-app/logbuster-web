import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HIGHLIGHTS } from "@/shared/lib/highlights";
import { fetchHighlightedMoviesMock } from "./highlights.mock";

async function load(highlight: Parameters<typeof fetchHighlightedMoviesMock>[0], limit = 10) {
  const pending = fetchHighlightedMoviesMock(highlight, limit);
  await vi.runAllTimersAsync();
  return pending;
}

describe("highlights.mock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("deixa Trilha Sonora vazia, para exercitar o padrão 'primeiro aspecto com filmes'", async () => {
    await expect(load("soundtrack")).resolves.toEqual([]);
    await expect(load("cinematography")).resolves.not.toHaveLength(0);
  });

  it("respeita o limite pedido", async () => {
    expect(await load("visual_effects", 10)).toHaveLength(10);
    expect(await load("visual_effects", 3)).toHaveLength(3);
  });

  it("devolve cada ranking ordenado por destaques, do maior para o menor", async () => {
    for (const highlight of HIGHLIGHTS) {
      const counts = (await load(highlight)).map((movie) => movie.highlightCount);
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
    }
  });

  it("devolve cópias, para o chamador não alterar os dados do mock", async () => {
    const first = await load("acting");
    first[0].highlightCount = 0;
    const second = await load("acting");
    expect(second[0].highlightCount).toBeGreaterThan(0);
  });
});
