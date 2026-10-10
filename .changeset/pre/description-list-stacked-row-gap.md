---
"@keystoneui/react": patch
---

Space the rows of a stacked `DescriptionList`.

`orientation="stacked"` drops the padding and separators that space row-oriented items, and nothing replaced them — so one pair's value sat flush against the next pair's label, and a two-column record read as a wall of text. Stacked lists now carry a row gap; row orientation is unchanged, since its items still carry their own padding.
