---
"@keystoneui/react": patch
---

A dropdown submenu prefers the left side inside a right-to-left DirectionProvider

Inside a right-to-left Base UI `DirectionProvider`, `DropdownMenuSubContent` with no `side` now prefers the left: when there is room, it opens to the left of its row and slides out from the row. Before, it preferred the right. For a horizontal row laid out right to left, the left edge is its inline end. Menus without a right-to-left `DirectionProvider` are unchanged, including under `dir="rtl"` on the document alone. An explicit `side` sets the preference in either direction, and Base UI can flip it to the other side when there is no room, as it does the default; set `side="right"` to keep the former placement. The submenu's chevron still points right under RTL.
