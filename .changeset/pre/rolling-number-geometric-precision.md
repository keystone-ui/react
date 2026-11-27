---
"@keystoneui/react": patch
---

RollingNumber's digits keep their width on hinted text

RollingNumber now sets `text-rendering: geometricPrecision` on its root. Where the system rounds each glyph to whole pixels (hinted text, common on Linux), tabular digits differed by a pixel or two each, so a number changed width as its digits changed. In our Linux Chromium measurements with Geist, changing only the digits at the same length now keeps the figure's width; a sign, a separator or a change of length still changes it. The figure is no longer hinted, which is most visible at small sizes, and where text was hinted its width changes once on upgrade (a 12px `1,284` measured about 4px narrower). To restore the browser's default, pass `className="[text-rendering:auto]"`: it replaces the root's value.

Countdown sets the same value on its root, so its placeholder, plain digits, separators and labels render like its animated digits. In our Linux Chromium measurements with Geist, the placeholder and two-digit cells keep the same boxes from the server HTML to the hydrated value; a compact day count or a value past two digits can still widen its cell. Its text is no longer hinted either. `className="[text-rendering:auto]"` on a Countdown restores the browser's default for all of it.
