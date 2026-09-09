---
"@keystoneui/react": minor
---

Add `Stat` — `StatValue`, `StatDelta` and the `deltaTone` helper.

The headline number of a metric and its change. Deliberately two parts plus a
helper rather than a full tile: a KPI tile is a `Card` with a label, a number
and a change, and `Card` already provides the surface system, so giving `Stat`
its own root would duplicate it.

The part that carries real logic is the tone. Colour comes from what the metric
*means*, not from the sign of the delta — revenue rising is good, p95 latency
rising is not, a headcount moving is neither. `StatDelta` takes a `direction`
(`"up-is-good"` | `"down-is-good"` | `"neutral"`) and derives the tone from the
direction and the sign together. The arrow follows the **sign** while the colour
follows the **tone**, so a green down-arrow is correct for a `down-is-good`
metric that improved.

`negative` maps to `--destructive`, not `--warning`: a metric that got worse is
bad news and there is already a token for that, while `--warning` means caution
or an approaching threshold. One channel, one meaning. Pass `tone="warning"`
when a number really is a caution state.

Formatting is not handled here — `children` carries the display text and `value`
carries only the signed number. Formatting a delta means choosing a locale, a
digit count, a sign convention and a unit, none of which a component should
decide for every consumer. `deltaTone` is exported for the same decision outside
a `StatDelta`.

Tone by colour alone fails WCAG 1.4.1, so `StatDelta` also renders a visually
hidden "improving" / "declining" / "needs attention" qualifier, suppressed when
the caller supplies their own `aria-label`.
