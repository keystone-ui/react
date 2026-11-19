---
"@keystoneui/react": minor
---

Add Reel, a native sideways scroller for one row of controls

`@keystoneui/react/reel` wraps exactly one row (a list of links, FilterChips) and scrolls it sideways when it is wider than its container. Each edge fades only where there is more to scroll, through a mask on the row (`ks-scroll-fade-x`), so it works on any surface. With `arrows="pointer"` (the default) an arrow appears at each end that has more to scroll, only on a device with a mouse or trackpad; `"always"` and `"none"` override that. A press scrolls 80% of the visible width.

- Arrows are never Tab stops, are hidden from assistive technology, and a press on one does not take focus.
- Reel clears a keyboard-focused or current item by the greater of 48px and the fade depth wherever the available scroll range allows. An item wider than the clear space aligns at inline start. Reel reveals the current item (the first with a nonempty `aria-current` other than `false`, or with FilterChips' `data-selected` present and other than `false`, comparing each value case-insensitively) at mount, on regaining room, and when a different item becomes current, provided the Reel's last measured content width and the item's bounding-box width are both positive. Reel preserves focus and the page's scroll position. Giving the item width later does not by itself trigger a reveal. If the current item gets its width later, or is moved to another row, give the Reel a new `key` or unmark the item and mark it again in a later update.
- Reduced motion turns the glide into a jump. To align the arrows' sides and paging (computed direction) with the fade and chevrons (the nearest explicit `dir="ltr"` or `dir="rtl"` on the Reel or an ancestor), put the explicit direction on an ancestor of the whole Reel and let the scroller and arrows inherit it.
