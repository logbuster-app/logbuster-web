import { describe, expect, it } from "vitest";
import { formatLocalDateTime, formatRating, parseUtcDate } from "./format";

describe("formatRating", () => {
  it("usa vírgula e uma casa decimal", () => {
    expect(formatRating(4.75)).toBe("4,8");
  });
});

describe("parseUtcDate", () => {
  it("respeita o sufixo Z e o offset explícito", () => {
    expect(parseUtcDate("2026-11-09T12:00:00Z")?.toISOString()).toBe("2026-11-09T12:00:00.000Z");
    expect(parseUtcDate("2026-11-09T09:00:00-03:00")?.toISOString()).toBe(
      "2026-11-09T12:00:00.000Z",
    );
  });

  it("assume UTC quando o horário vem sem fuso", () => {
    expect(parseUtcDate("2026-11-09T12:00:00")?.toISOString()).toBe("2026-11-09T12:00:00.000Z");
    expect(parseUtcDate("2026-11-09T12:00:00.123456")?.toISOString()).toBe(
      "2026-11-09T12:00:00.123Z",
    );
  });

  it("devolve null para valores inválidos ou vazios", () => {
    expect(parseUtcDate("")).toBeNull();
    expect(parseUtcDate("não é data")).toBeNull();
  });
});

describe("formatLocalDateTime", () => {
  it("formata data e hora em pt-BR", () => {
    const text = formatLocalDateTime(new Date(2026, 10, 9, 9, 30));
    expect(text).toMatch(/09\/11\/2026/);
    expect(text).toMatch(/09:30/);
  });
});
