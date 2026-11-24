import { describe, expect, it } from "vitest";
import { HIGHLIGHTS, HIGHLIGHT_LABELS, isHighlight } from "./highlights";

describe("highlights", () => {
  it("mantém a ordem oficial dos seis destaques", () => {
    expect(HIGHLIGHTS).toEqual([
      "soundtrack",
      "cinematography",
      "screenplay",
      "acting",
      "direction",
      "visual_effects",
    ]);
  });

  it("tem um nome em português para cada destaque, na mesma ordem", () => {
    expect(Object.keys(HIGHLIGHT_LABELS)).toEqual([...HIGHLIGHTS]);
    expect(HIGHLIGHT_LABELS.soundtrack).toBe("Trilha Sonora");
    expect(HIGHLIGHT_LABELS.visual_effects).toBe("Efeitos Especiais");
  });

  it("isHighlight aceita só os valores oficiais", () => {
    expect(isHighlight("acting")).toBe(true);
    expect(isHighlight("Acting")).toBe(false);
    expect(isHighlight("")).toBe(false);
    expect(isHighlight(null)).toBe(false);
    expect(isHighlight(undefined)).toBe(false);
    expect(isHighlight(42)).toBe(false);
  });
});
