"use client";

import { cn } from "@/lib/utils";

export interface SeriesDef {
  /** Slot 1-5 in the chart ramp. Omit to take the position in the list. */
  color?: number;
  key: string;
  label: string;
  /**
   * Use a named token instead of a ramp slot, e.g. `"muted-foreground"`.
   *
   * The escape hatch matters: an "Other" or "Unclassified" band is not a
   * category, and giving it a categorical hue claims one exists where there is
   * only missing evidence.
   */
  token?: string;
}

/**
 * The single place a series' colour is decided.
 *
 * Both the mark and the legend swatch resolve through this, so they cannot
 * disagree — a legend that says one thing while the band says another is worse
 * than no legend.
 */
export function seriesColor(item: SeriesDef, index: number): string {
  if (item.token) {
    return `var(--${item.token})`;
  }
  return `var(--chart-${item.color ?? (index % 5) + 1})`;
}

interface SeriesLegendProps {
  hidden: ReadonlySet<string>;
  onToggle: (key: string) => void;
  series: readonly SeriesDef[];
}

export function SeriesLegend({ hidden, onToggle, series }: SeriesLegendProps) {
  const visible = series.filter((item) => !hidden.has(item.key)).length;

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {/* Rendered from `series`, never from recharts' payload: the payload
          drops hidden entries, which would give you a chart you can narrow and
          then never widen again. */}
      {series.map((item, index) => {
        const off = hidden.has(item.key);
        // An empty chart is not a view of anything, and a reader cannot tell it
        // from "no data" — so the last visible series refuses to switch off.
        const locked = !off && visible === 1;

        return (
          <li key={item.key}>
            <button
              aria-pressed={!off}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
                off
                  ? "text-muted-foreground line-through opacity-60"
                  : "text-foreground",
                locked && "cursor-not-allowed"
              )}
              disabled={locked}
              onClick={() => onToggle(item.key)}
              title={
                locked ? "At least one series has to stay visible" : undefined
              }
              type="button"
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: seriesColor(item, index) }}
              />
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
