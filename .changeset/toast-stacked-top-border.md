---
"@keystoneui/react": patch
---

`Toast`: fix the top edge disappearing when toasts stack.

The root carried `bg-clip-padding`, which stops a toast's own background
painting under its 1px border. The border tokens are semi-transparent, so the
border then composited against whatever sat *behind* the element rather than
against the toast's own surface. A lone toast was fine — the backdrop was the
page — but stacked toasts underlap each other, so the frontmost toast's top
edge rendered against the neighbouring card and washed out, leaving a card
that looked open at the top. The border survived only in the ~18px at each end
that the (scaled-down) card behind didn't cover, which read as the edge being
cropped.

Dropping `bg-clip-padding` paints the background under the border, so all four
edges render identically regardless of backdrop. The root also moves from
`border-border-muted` to `border-border`, matching shadcn's Base UI toast,
which uses neither `bg-clip-padding` nor the muted token. Measured on the
rendered pixels, the top edge goes from 5 to 23 levels of separation against a
card interior of 24 — the side edges measure 15, so it is no longer the weakest
edge on the card.
