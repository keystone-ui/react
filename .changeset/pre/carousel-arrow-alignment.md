---
"@keystoneui/react": patch
---

Fix `CarouselPrevious`/`CarouselNext` sitting below the middle of the slides when `CarouselDots` or `CarouselCounter` is used.

The arrows are absolutely positioned with `top-1/2` against the `Carousel` root, which wraps the slides *and* anything rendered under them — so dot indicators and their margin dragged the arrows off the slide's midline. The root is now a single-column grid and the arrows take the first grid row (`CarouselContent`) as their containing block, so controls below the slides no longer shift them. The same fix straightens `CarouselNext` in vertical carousels, where it previously landed below the dots.

`CarouselContent` must be the first child of `Carousel` for this to apply — the composition every example already uses. No public API change. If you worked around the old behavior with a manual offset such as `top-[calc(50%-1rem)]`, remove it.
