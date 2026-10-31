---
"@keystoneui/react": patch
---

Components carry their `base.css` motion and layering tokens inline as fallbacks: `z-(--z-modal,50)`, `duration-(--duration-base,180ms)`, `ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1))`.

A component installed from the registry can be newer than the `base.css` in your project, and Open in v0 loads no `base.css` at all. Without the fallbacks a missing token meant `z-index: auto` — a modal rendering under the page — and no transition. Rendered values are unchanged when `base.css` is present. A test fails on any token read without a default.
