---
"@keystoneui/react": minor
---

The control height ladder reads from CSS variables: `--ks-control-xs`, `--ks-control-sm`, `--ks-control-md` and `--ks-control-lg` (24 · 32 · 40 · 48px by default, defined in `base.css` from `--spacing`).

Button, Input, InputGroup, SelectTrigger, NativeSelect, Toggle and TableHead use `h-(--ks-control-md,2.5rem)` and its siblings instead of a literal `h-10`, so you can change density with one set of values instead of a fork of every control. Override them app-wide in `:root`, or for one area with a class: `<section className="[--ks-control-md:2rem]">`. Rendered sizes are unchanged at the defaults, and each class carries its default as a fallback.

A `className="h-12"` override on a control still wins: tailwind-merge reads `h-(--var)` as a height.
