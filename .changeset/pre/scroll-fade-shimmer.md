---
"@keystoneui/react": minor
---

Add the `scroll-fade`, `scroll-fade-x` and `shimmer` utilities to `base.css`.

- `scroll-fade` / `scroll-fade-x` fade a scroll container's edges only where there is more to scroll, through a scroll-driven animation and a mask: no listener, no overlay. Tune the depth with `--scroll-fade-size`. Browsers without scroll-driven animations show no fade and still scroll.
- `shimmer` sweeps a light highlight across text for live status ("Thinking…"). Its period derives from `--duration-slow`, so `prefers-reduced-motion` freezes it.

Both are Tailwind `@utility`s, emitted only where used. They are documented on the new Theming → CSS Utilities page.
