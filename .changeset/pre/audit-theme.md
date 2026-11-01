---
"@keystoneui/mcp": minor
---

Add `keystoneui audit --theme [css] [--strict]`: measure your own theme's contrast the way keystone measures its defaults.

It reads the top-level `:root` and `.dark` blocks of your CSS (the file `components.json` names, or a path you pass), skips `@media print` ink tokens, and reports eleven text-on-surface pairs — foreground, card, popover, primary, secondary, muted, accent, destructive, success, warning, info — against WCAG AA in both modes. `--strict` exits 1 on a failure, for CI. Values that need a browser to resolve (`var()`, `color-mix()`, alpha) are reported as skipped, never guessed. No new dependency: OKLCH converts straight to linear sRGB.
