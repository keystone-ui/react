---
"@keystoneui/react": patch
---

Badge: soft status text stays readable on a selected or hovered table row

Four soft status text colours are slightly adjusted, on every surface: in light mode the warning and error text is a little darker, and in dark mode the info and error text is a little lighter. Only lightness changes; the hue, the tinted fill and the border are unchanged, and success, light-mode info and dark-mode warning are untouched. A soft Badge's text now reaches a 4.5:1 contrast ratio on a selected or hovered table row (`bg-muted`, `bg-muted/50`) as well as on the page background; before, light warning and error and dark info and error fell just short on a selected row.
