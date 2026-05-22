/** Parses a non-negative AMD integer from admin size-catalog price inputs. */
export function parsePriceAmd(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
