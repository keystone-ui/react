---
"@keystoneui/react": minor
---

Destructive colours now meet WCAG AA contrast in light and dark mode

The label on a destructive Button did not reach the 4.5:1 contrast ratio WCAG AA asks of normal text. It now does in the style item, all six registry themes and every theme the theme builder generates:

- **Light mode.** `--destructive` is a little darker: `oklch(0.577 0.245 27.325)` becomes `oklch(0.54 0.245 27.325)`. Only the lightness changes; the hue and chroma are the same, and `--destructive-foreground` is still near-white. Label contrast as a browser paints it rises from 4.36:1 to 4.85:1, and from 4.13:1 to 4.54:1 under `hover:bg-destructive/90`. `text-destructive` error text on the page rises from 4.76:1 to 5.30:1.
- **Dark mode.** `--destructive-foreground` changes from near-white `oklch(0.971 0.013 17.38)` to a dark red, `oklch(0.258 0.092 26.042)`, like the dark-mode success, warning and info foregrounds. `--destructive` itself is unchanged. Label contrast rises from 2.65:1 to 5.58:1, and to at least 4.61:1 under hover. The same dark red marks an invalid checked Checkbox or Radio in dark mode. A darker red with white text could not reach 4.5:1 without pulling `text-destructive` on the dark page below 4.5:1, so the foreground flips instead. `text-destructive` stays at 6.88:1 on the page. A disabled destructive Button's label in dark mode is now as faint as it already was in light mode, about 1.5:1 instead of 3:1.

If you installed the style or a theme before this release, your CSS still has the old values. Run the same add command again, for example `npx shadcn add https://keystoneui.io/r/themes/zinc.json`, or `npx shadcn add https://keystoneui.io/r/theme/<code>.json` for a theme from the theme builder. You can also edit the two values by hand: `--destructive` in `:root`, and `--destructive-foreground` in `.dark`.
