---
"@keystoneui/react": patch
---

Add the `dashboard-01` block: an analytics dashboard.

A KPI row whose deltas take their tone from what the metric *means* (the
bounce-rate tile is `down-is-good`, so a fall renders green with a down arrow),
a stacked revenue chart with a toggleable legend, a sessions area chart, and a
sortable, paginated top-pages table in a flush card.

`recharts` is a dependency of the **block**, not of `@keystoneui/react` — the
library stays dependency-light, the same way `tickets-01` carries `@dnd-kit`.
The chart layer is shadcn's `chart.tsx` vendored into the block, minus
`ChartLegend` (the block ships a toggleable one, so recharts' own never mounts)
and keeping two upstream fixes with their reasons in comments: `aspect-auto`
rather than `aspect-video`, which under an explicit pixel height produces a
462px floor and a horizontal document scrollbar, and an added `min-w-0`.

Notable patterns the block is meant to teach: one `seriesColor()` resolves both
the mark and the legend swatch so they cannot disagree; the "Other" band uses
`--muted-foreground` rather than a ramp slot, because a fold of small values is
not a category; panels take `format="money"` rather than a formatter function,
since the installed entry point is a server component and a function cannot
cross that boundary; and charts pass `isAnimationActive={!reducedMotion}`,
which is the one motion case a stylesheet cannot reach.
