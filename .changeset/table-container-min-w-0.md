---
"@keystoneui/react": patch
---

`Table`'s scroll container no longer forces its grid or flex track open.

As a grid or flex item, the container's `min-width` resolved to `min-content` —
the table's full intrinsic width — so a wide table inside a grid pushed its
track open and handed the whole document a horizontal scrollbar. It already
scrolls internally, so it never needed to be wider than its track: `min-w-0`
now says so.

This is the most common instance of a general trap (`[&>*]:min-w-0` on grids),
and the one place the library owns the code and can simply fix it.
