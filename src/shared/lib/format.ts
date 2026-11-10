/** Formata uma nota no padrão brasileiro com uma casa decimal (ex.: 4.75 → "4,8"). */
export function formatRating(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
