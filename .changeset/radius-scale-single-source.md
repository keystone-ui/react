---
"@keystoneui/react": patch
---

The derived radius scale is declared in one file instead of five.

`--radius-sm` … `--radius-4xl` were written out in `base.css`, `global.css`,
Storybook's `preview.css`, the theme-builder's CSS export **and** the
`registry:style` item. Tailwind takes the later `@theme inline` block whole, so
every one of those shadowed `base.css` silently — editing the scale in the
library changed nothing anywhere, which a sentinel value confirmed: set
`--radius-xl` to `calc(var(--radius) * 9.9)` in `base.css` and the compiled
output still said `1.4`.

The consequence for consumers is the one that matters. `shadcn add
@keystone/default` wrote the scale into their `globals.css`, where it is frozen
at install time and outranks the library's. A scale corrected in a release
would never have reached them.

So `--radius` stays the token — consumers own it in `:root`, the way they own
colors — and the derivation is library mechanism that arrives with
`@import "@keystoneui/react/base.css"` and tracks the package. This matches how
shadcn splits it: their `shadcn/tailwind.css` ships `@custom-variant` and
keyframes, never theme values.

Nothing renders differently: every surface already imported `base.css`, and the
copies were identical to it.

If you want a different derivation, declare your own `@theme inline` after the
import — the later block still wins, and that is now the documented way to do
it rather than something four files did by accident.
