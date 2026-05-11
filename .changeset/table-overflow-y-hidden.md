---
"@keystoneui/react": patch
---

Fix phantom vertical scrollbar inside `Table`.

The `[data-slot=table-container]` wrapper set only `overflow-x: auto`. Per CSS Overflow L3, that promotes the default `overflow-y: visible` to `auto`, which on macOS "Show scrollbars: Always" renders a permanent vertical gutter inside every table card. Pin the Y axis to `hidden` so the implicit promotion can't recur. No public API change.
