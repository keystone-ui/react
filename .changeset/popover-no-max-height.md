---
"@keystoneui/react": patch
---

Remove `max-height` constraint from `PopoverContent`. Popovers can now hold arbitrarily long content — consumers control sizing explicitly via `className` if they need it. Aligns with the existing `overflow-auto` on `PopoverContent`.
