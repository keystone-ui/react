---
"@keystoneui/react": minor
---

Make `Drawer` content scrollable by default and add `DrawerBody`.

- **Fix:** `[data-slot=drawer-inner-content]` was `overflow-hidden`, so a plain `DrawerHeader` + content + `DrawerFooter` composition silently clipped anything past the popup's `max-h-[80vh]` cap, with no scroll affordance. It is now a Y-axis scroller (`overflow-y-auto overflow-x-hidden overscroll-contain`). The X axis is pinned to `hidden` deliberately: `overflow-y: auto` alone promotes the default `overflow-x: visible` to `auto` per CSS Overflow L3, which paints a phantom gutter on macOS "Show scrollbars: Always" and makes Base UI read a bogus cross-axis scroll container, swallowing swipe-to-dismiss on diagonal touch drags. This also repairs a second defect: Base UI only recognises `overflow-y: auto | scroll` as a scroll region, so with `overflow-hidden` a downward drag on clipped content dismissed the sheet instead of scrolling it.
- Drawers that already nest their own `overflow-y-auto` child are unaffected. That child's overflow is not `visible`, so its automatic minimum size is `0`, it shrinks to absorb the overflow, and the outer region never scrolls.
- **New:** `DrawerBody` (`data-slot="drawer-body"`) — the scrolling middle region, making the pinned-header / scrolling-body / pinned-footer pattern a first-class API instead of a hand-rolled `<div className="overflow-y-auto px-4">`. Horizontal padding only (`px-4`), so it never doubles against `DrawerHeader` / `DrawerFooter`'s `p-4`.
- `DrawerHeader` and `DrawerFooter` now carry `shrink-0` so they stay pinned alongside `DrawerBody`. `DrawerFooter` keeps `mt-auto` for compositions that don't use `DrawerBody`.
