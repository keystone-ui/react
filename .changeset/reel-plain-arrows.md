---
"@keystoneui/react": minor
---

Reel: plain arrows and an adjustable fade

- `arrowVariant="plain"` draws each arrow as a bare chevron in the muted text colour, with no fill, border or shadow, for a row with its own track, such as tabs. A bare chevron cannot cover what is under it, so while a plain arrow shows, Reel hides the first five spacing units (1.25rem with the default spacing scale) of the row on that side, and the fade starts after that. This also holds in browsers without scroll-driven animations. `arrowVariant="default"` (the default) is the round outlined arrow. `arrows` still decides when either style can show.
- Set `--ks-reel-fade-size` (a length with a unit) on the Reel or an ancestor to choose the depth of the soft fade. Unset, it is 3rem where an arrow can show (2rem for plain arrows) and 1.5rem elsewhere.
- Reel clears a keyboard-focused or current item by the greater of 48px, the arrow's width, and any hidden strip plus the fade depth, wherever the available scroll range allows.
- The scroller is its own stacking context in every browser, so an arrow stays above row items that set a `z-index`.
- Reel also treats `aria-selected="true"` as current. A row that already contains an element with `aria-selected="true"` (a tab, a listbox option) is now scrolled to it when the Reel gains room or the selection changes; when several items are marked, the first in DOM order is used, so an earlier selected element takes precedence over a later `aria-current` or `data-selected` item.
