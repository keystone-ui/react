---
"@keystoneui/react": patch
---

Carousel auto-hide arrows keep Button's transitions

With `autoHideArrows`, the previous and next arrows transitioned only `opacity`: the fade's `transition-opacity` replaced Button's own transition list, so the hover colour and press scale snapped. The arrows now fade and keep every transition Button has.
