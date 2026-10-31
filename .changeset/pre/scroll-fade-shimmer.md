---
"@keystoneui/react": minor
---

Add the `ks-scroll-fade`, `ks-scroll-fade-x` and `ks-shimmer` utilities to `base.css`.

- `ks-scroll-fade` / `ks-scroll-fade-x` fade a scroll container's edges only where there is more to scroll, through a scroll-driven animation and a mask: no listener, no overlay. Tune the depth with `--ks-scroll-fade-size`. Browsers without scroll-driven animations show no fade and still scroll.
- `ks-shimmer` sweeps a light highlight across text for live status ("Thinking…"). Its period derives from `--duration-slow`, so `prefers-reduced-motion` freezes it.

Both are Tailwind `@utility`s, emitted only where used. They are documented on the new Theming → CSS Utilities page.

The names carry `ks-` because `shadcn/tailwind.css` defines its own `scroll-fade` and `shimmer`, and Tailwind applies both rules when two utilities share a name — so a keystone app with shadcn's chat components keeps both working.
