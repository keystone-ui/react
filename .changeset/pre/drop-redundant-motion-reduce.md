---
"@keystoneui/react": patch
---

Drop redundant `motion-reduce:` utilities from per-component class lists. `prefers-reduced-motion` is now handled centrally in `base.css`, so primitives no longer need to opt-in individually. Behavior unchanged for end users.
