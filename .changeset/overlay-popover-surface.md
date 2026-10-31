---
"@keystoneui/react": patch
---

**Modal, AlertDialog and Drawer now use the popover surface.** They painted with `bg-background`, the page's own colour, so in dark mode a modal over its dimmed backdrop all but disappeared. They now paint `bg-popover text-popover-foreground` like every other floating surface, and Modal and AlertDialog take the same `ring-popup-ring` hairline as the popups. Light mode is unchanged: both tokens are white in every shipped theme.
