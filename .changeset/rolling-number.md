---
"@keystoneui/react": minor
---

Add RollingNumber, a formatted number whose changed digits roll

`@keystoneui/react/rolling-number` prints `value` exactly as `Intl.NumberFormat(locale, format)` does and, when `value` changes, rolls only the digits that changed, one row each, up when the value rose and down when it fell (`trend` fixes the direction). The roll is a CSS transition timed by `--duration-slow` and is skipped under `prefers-reduced-motion` and with `animated={false}`. Assistive technology reads the formatted number once, never the moving digits, and copying the number gives the same text as copying the plain formatted number, once (tested in Chromium). The default locale is `en-US`; for consistent server and client text, use the same value and formatting options, a locale supported by both runtimes, and compatible Intl locale data. A number that gains or loses a digit changes width at once, and in mixed-direction text, the placement of digit groups, signs, currency and percent symbols can differ from plain text.

RollingNumber passes `locale` and `format` untouched to `new Intl.NumberFormat(locale, format)` each time React calls it, so the text and any error are Intl's. It compares the options Intl resolved (`resolvedOptions()`) with those of the render before. When they are the same, changed digits roll, even if you pass a new object every render. When they differ, the number snaps to the new text.

`format` and `locale` must be plain data. When the number or its resolved formatting changes, React calls the component again and Intl reads the inputs again. StrictMode adds another call during development. A digit that rolls adds one more call two frames later. An options object or locale whose getters return a different value, or throw, on a later read is not supported. An object edited in place is read again the next time the component renders.
