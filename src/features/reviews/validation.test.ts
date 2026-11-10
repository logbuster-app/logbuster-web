import { describe, expect, it } from "vitest";
import { type ReviewFormValues, validateReview } from "./validation";

const valid: ReviewFormValues = {
  movieId: "tt0133093",
  rating: 4.5,
  authorName: "  Thyago  ",
  content: "  Uma análise suficientemente longa.  ",
  isSpoiler: true,
  highlights: ["direction", "visual_effects"],
};

describe("validateReview", () => {
  it("normaliza com trim e devolve o payload do service", () => {
    expect(validateReview(valid)).toEqual({
      ok: true,
      input: {
        movieId: "tt0133093",
        rating: 4.5,
        authorName: "Thyago",
        content: "Uma análise suficientemente longa.",
        isSpoiler: true,
        highlights: ["direction", "visual_effects"],
      },
    });
  });

  it.each([null, 0, 4.3, 5.5])("rejeita a nota %s", (rating) => {
    expect(validateReview({ ...valid, rating })).toMatchObject({
      ok: false,
      error: expect.stringMatching(/nota/),
    });
  });

  it.each([0.5, 5])("aceita os limites da nota (%s)", (rating) => {
    expect(validateReview({ ...valid, rating }).ok).toBe(true);
  });

  it("valida o nome entre 2 e 50 caracteres após trim", () => {
    expect(validateReview({ ...valid, authorName: " A " }).ok).toBe(false);
    expect(validateReview({ ...valid, authorName: "A".repeat(51) }).ok).toBe(false);
    expect(validateReview({ ...valid, authorName: "Al" }).ok).toBe(true);
    expect(validateReview({ ...valid, authorName: "A".repeat(50) }).ok).toBe(true);
  });

  it("valida a análise entre 10 e 2000 caracteres após trim", () => {
    expect(validateReview({ ...valid, content: "   curta   " }).ok).toBe(false);
    expect(validateReview({ ...valid, content: "x".repeat(2001) }).ok).toBe(false);
    expect(validateReview({ ...valid, content: "x".repeat(10) }).ok).toBe(true);
    expect(validateReview({ ...valid, content: "x".repeat(2000) }).ok).toBe(true);
  });

  it("rejeita mais de 2 destaques", () => {
    expect(
      validateReview({ ...valid, highlights: ["direction", "acting", "screenplay"] }).ok,
    ).toBe(false);
  });
});
