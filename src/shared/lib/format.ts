/** Formata uma nota no padrão brasileiro com uma casa decimal (ex.: 4.75 → "4,8"). */
export function formatRating(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/**
 * Converte um timestamp do backend em `Date`. O backend envia UTC; se a string vier
 * sem fuso (ex.: "2026-11-09T12:00:00"), assume UTC em vez de horário local.
 * Retorna `null` quando o valor é inválido.
 */
export function parseUtcDate(value: string): Date | null {
  const trimmed = value.trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  const isDateTime = trimmed.includes("T");
  const date = new Date(isDateTime && !hasTimezone ? `${trimmed}Z` : trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Data e hora no fuso local do navegador, em pt-BR (ex.: "09/11/2026, 09:30"). */
export function formatLocalDateTime(date: Date): string {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
