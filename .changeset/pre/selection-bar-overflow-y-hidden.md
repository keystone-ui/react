---
"@keystoneui/react": patch
---

Fix phantom vertical scrollbar inside `SelectionBar`.

The bar's inner container set only `overflow-x: auto`, which per CSS Overflow L3 promotes the default `overflow-y: visible` to `auto` — a hidden vertical scroll context that renders a gutter on macOS "Show scrollbars: Always". Pin the Y axis to `hidden`. No public API change.
