/** Parse a query string value into a finite number, or undefined if empty/invalid. */
export function parsePriceQueryParam(
  value: string | null | undefined
): number | undefined {
  if (value == null || String(value).trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
