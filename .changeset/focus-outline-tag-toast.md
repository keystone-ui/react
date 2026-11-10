---
"@keystoneui/react": patch
---

`TagRemove` and the `Toast` close button show a keyboard focus outline again
Both paired `outline-none` with `focus-visible:outline-2`. In Tailwind v4, `outline-none` also sets `--tw-outline-style: none`, and `outline-2` reads that variable, so the focus outline computed to `none`. They now draw the same 2px `ring/50` outline, offset 2px, as `Button`. A mouse click still shows no outline.
