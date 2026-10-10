---
"@keystoneui/react": minor
---

`Card` gains a `variant` prop and drives all spacing from `--card-spacing`.

`variant="outline"` is a second surface tier: no fill, so the page shows
through. It is the tier for chart and table panels, where a filled card on a
filled page reads as two stacked surfaces. `filled` remains the default and is
unchanged — verified mechanically, not by eye: `p-6` and `--spacing(6)` both
compile to `calc(var(--spacing) * 6)`, so every size resolves to the same value
it did before.

Both variants use a ring rather than a border. A ring is a box-shadow with no
layout impact, where a border insets the content box by 1px — so flipping a row
of cards between variants would otherwise shift every child. `outline` rings
`border` at full strength where `filled` rings `border-muted`, because with no
fill the edge is the only thing defining the card.

All of Card's padding and gap, sub-parts included, now resolve from one
`--card-spacing` custom property, replacing nine `group-data-[size=…]/card`
selectors across five sub-parts. That makes any spacing reachable from
`className`, including the table-flush panel:

```tsx
<Card variant="outline" className="[--card-spacing:0px]">
  <Table />
</Card>
```

`size` resolves the variable through CVA rather than through
`data-[size=sm]:[--card-spacing:…]` variants on the base class. Those look
equivalent and are not: a variant modifier is part of tailwind-merge's group
key, so an unmodified consumer override does not replace the size-scoped
declarations, and the survivors out-specify it (class+attribute beats class) —
`<Card size="sm" className="[--card-spacing:0px]">` silently kept its padding.
The tests pin the override at all three sizes, because a default-size-only test
passes on that bug.
