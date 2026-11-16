---
"@keystoneui/react": patch
---

ToggleGroup: vertical groups move focus with the Up and Down arrows

`<ToggleGroup orientation="vertical">` stacked its items but still moved focus with ArrowLeft and ArrowRight, because `orientation` only set `data-orientation` and never reached the Base UI primitive. It is now passed through, so a vertical group responds to ArrowUp and ArrowDown. Horizontal groups, including their mirrored arrows under `dir="rtl"`, are unchanged.
