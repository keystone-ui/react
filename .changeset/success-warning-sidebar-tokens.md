---
"@keystoneui/react": minor
---

Add `--success`, `--warning` and `--sidebar-*` semantic tokens.

`Progress` and `CircularProgress` previously inlined raw oklch for their
`success` and `warning` color variants, with an in-file comment acknowledging
it as an exception to the no-raw-colors rule. Both now read `var(--success)` /
`var(--warning)`, so status tones are themeable and `text-success` /
`bg-warning` are available to consumers instead of `text-emerald-600`.

Three notes:

- **Visual change in dark mode.** The tokens re-step for a dark surface
  (green-400 / amber-400) where the inlined values were the light-mode hues in
  both modes, which read muddy on a dark card. Light mode is unchanged: the new
  light values are byte-identical to what was inlined.
- **No action required on upgrade.** The variants resolve
  `var(--success, <previous literal>)`, so a consumer who has not re-run the
  style install keeps exactly the previous rendering.
- `--warning-foreground` is deliberately dark rather than near-white. Near-white
  on amber-500 is ~1.9:1, a WCAG failure.

The eight `--sidebar-*` tokens are declared as aliases of the theme tokens.
Keystone ships no sidebar; these exist so an imported shadcn sidebar follows the
active keystone theme instead of shadcn's own neutral palette.
