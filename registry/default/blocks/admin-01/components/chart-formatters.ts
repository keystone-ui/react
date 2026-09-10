/**
 * Named value formatters.
 *
 * Panels take `format="money"` rather than a `formatter` function, because the
 * installed entry point of this block is `app/dashboard/page.tsx` — a server
 * component. A function cannot cross that boundary: React rejects it at render
 * time. A block that taught `formatter={(v) => …}` would teach a pattern that
 * breaks the moment someone installs it.
 */

export type ValueFormat = "compact" | "money" | "number" | "percent";

const NUMBER = new Intl.NumberFormat("en-US");
const COMPACT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  notation: "compact",
});
const MONEY = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});
const PERCENT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  style: "percent",
});

const FORMATTERS: Record<ValueFormat, (value: number) => string> = {
  compact: (value) => COMPACT.format(value),
  money: (value) => MONEY.format(value),
  number: (value) => NUMBER.format(value),
  percent: (value) => PERCENT.format(value),
};

/**
 * `null` stays `null` all the way to the em dash.
 *
 * Coercing with `Number(value)` turns an absent measurement into `0`, which
 * then prints as "$0" or "0%" — a reading the data never took. The distinction
 * between "nothing happened" and "we did not measure" is worth the extra
 * branch.
 */
export function toValue(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function formatValue(
  value: unknown,
  format: ValueFormat = "number"
): string {
  const numeric = toValue(value);
  return numeric === null ? "—" : FORMATTERS[format](numeric);
}
