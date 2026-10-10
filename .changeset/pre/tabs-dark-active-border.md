---
"@keystoneui/react": patch
---

`Tabs`: drop the 1px border on the active tab indicator in dark mode.

The `default` variant's active-tab "card" was rendered with `border-input` in dark mode, producing a visible outline that didn't appear in light mode (where `shadow-sm` provides separation). The border is now removed; the dark-mode fill (`bg-input-bg`) is unchanged. The `line` variant and light mode are unaffected.
