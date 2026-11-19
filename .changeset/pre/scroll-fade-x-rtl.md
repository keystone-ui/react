---
"@keystoneui/react": patch
---

Fix `ks-scroll-fade-x` fading the wrong edges in right-to-left

In a right-to-left container the inline start is the right edge, but the mask was always drawn from the left, so at the start of the row the visible right edge faded and the left edge, with more content beyond it, did not. The horizontal fade follows the nearest `dir="ltr"` or `dir="rtl"` on the scroller or an ancestor. A CSS direction or `dir="auto"` inherits the fade setting from that boundary. With neither boundary the fade defaults to LTR. Explicit LTR rows and the default LTR gradient render as before. The vertical fade is unchanged.
