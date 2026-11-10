---
"@keystoneui/react": minor
---

Nested bottom drawers now stack. A `Drawer` rendered inside another drawer's `DrawerContent` already nested in Base UI, but nothing showed it: the front drawer simply covered the one behind. Now, while a nested drawer is open, the drawer behind steps back — 5% narrower and 0.75rem higher per drawer in front of it — and takes the front drawer's height, so its top edge peeks out above the front one the way an iOS sheet stacks. Swiping the front drawer down eases the one behind back into place rather than snapping at the end.

`DrawerContent` no longer carries `h-auto`. Its height is still `auto` by default; while a nested drawer is open it follows Base UI's measured heights so the change can animate. That rule lives in `@layer components`, so an `h-*` class you pass to `DrawerContent` still wins.
