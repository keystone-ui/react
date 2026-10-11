---
"@keystoneui/react": minor
---

Add a five-slot categorical chart ramp (`--chart-1` … `--chart-5`), and correct
`--success-foreground`.

**`--success-foreground` was wrong and is now dark.** Shipped near-white, it
measured 3.10:1 on the success green — a WCAG failure, and exactly the mistake
already documented for `--warning-foreground`. Dark text gives 4.60 light /
6.55 dark. If you have already copied the token block, re-copy it.

**The chart ramp separates by lightness, not hue.** Every form of colour-vision
deficiency preserves lightness while collapsing hue, so the ramp staggers
lightness deliberately rather than pairing each hue with the lightness that
looks natural for it. That is not a theoretical concern: a straight port of a
twelve-slot palette measured **0.9 ΔE** between two slots under simulated
tritanopia — below a just-noticeable difference, so a tritanope could not tell
those two series apart at all. Natural hue/lightness pairing reached 6-7. The
shipped ramp reaches 11.1 in both modes.

Five slots rather than twelve, because crowding hues into the same space is
what erodes that separation, and a dashboard stacks four or five channels plus
an "Other".

Like the status tones, the ramp is theme-independent, so the six theme items do
not carry it — only the style item does.

Also adds `apps/docs/tests/palette.test.ts`, which measures all of the above
from the real CSS rather than a copy: chart contrast against the card, worst
pair in normal vision, worst pair under all three CVD simulations, and the
status-tone and per-theme text contrasts. Every threshold is a floor pinned at
what the palette actually achieves, with the measured figure beside it, so it
fails on regression rather than asserting compliance.

One thing it records rather than fixes: `--destructive-foreground` on
`--destructive` is 4.47:1 light and 2.63:1 dark, below AA. That predates these
tokens and is the label colour on every destructive Button in every theme, so
re-picking it deserves its own decision. The test pins it so it cannot get
worse.
