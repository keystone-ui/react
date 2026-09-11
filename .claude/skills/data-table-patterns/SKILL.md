---
name: data-table-patterns
description: Conventions for filterable data-table surfaces — filter toolbars, applied state, sorting, pagination footers, and the mobile fold. Apply when building or editing block demos under apps/docs/demos/blocks/.
globs: apps/docs/demos/blocks/**/*
alwaysApply: false
---

# Data-table patterns

The library's other skills cover building components. This one covers
*composing* them into a filterable table, which is where `admin-01` and
`tickets-01` both live and where the same handful of mistakes keep recurring.

Every rule below was a defect first. Where a guard exists, it is named.

---

## Filter controls name the dimension they act on

A trigger reads `Status: All`, never `All Statuses`. The dimension goes in a
muted span, the value at full strength.

```tsx
<DropdownMenuTrigger render={<Button variant="outline" />}>
  <span className="font-normal text-muted-foreground">Status:</span>
  {statusLabel(value)}
</DropdownMenuTrigger>
```

**Why.** A bare value turns ambiguous the moment it sits beside another one.
`admin-01` shipped `Deposit` next to `All statuses` — one control naming a
value with no dimension, the next naming a dimension with no value. Is
"Deposit" a type or a status? You cannot tell from the control.

**The exception:** a value that names its own dimension takes no label. A date
range reads `Last 24h`; `Period: Last 24h` says it twice.

**The corollary:** once the trigger says `Status:`, the option list says `All`,
not `All Statuses`. So does the mobile drawer row. Restating the dimension in
the value is the same error inverted.

**Not every trigger is a filter.** `Table options`, `Filters`, `Add filter`
name a menu rather than report a value — they take no label. The test is
whether the trigger's text changes with state.

Guard: `e2e/tickets-01.spec.ts` asserts all three triggers at once, which pins
the exception as well as the rule.

---

## Two filter layouts, and how to choose

**Inline pills** — every filter a control on the toolbar, each naming its own
dimension. **Drawer and chips** — all filters behind one `Filters` button, with
the applied ones as removable `Key: value` chips underneath.

| | drawer + chips | inline pills |
|---|---|---|
| change a filter | 3–4 clicks | 2 |
| remove one | 1 click on its ✕ | 2, through its menu |
| read what is applied | the chip row is the answer | scan every pill for the set ones |
| see what is filterable | open the drawer | already on screen |
| desktop vs mobile | one surface | two, kept in step by hand |

Pills suit a table someone sits in front of, flipping a filter at a time while
they work. The drawer suits one they filter once and then read.

The drawer layout also removes a fork, which is worth more than it sounds: its
filters live in one surface at every width, so there is no second tree to keep
in step. `admin-01` shipped three filters reachable on no phone at all under
the pills layout; that failure cannot occur under this one.

Past roughly six filters the pills stop fitting and the choice makes itself.

The drawer's shell should still suit its width: a bottom sheet on a phone, a
side panel on a desktop. `swipeDirection` is a prop, not a class, so render the
drawer twice behind a CSS fork rather than switching it at runtime — a media
query has to guess on the server and flip after hydration. Keep one shell out
of the accessibility tree, or both triggers are announced.

**Both are renderings of one model.** Whichever you pick, declare each filter
once as a descriptor — `{ key, label, empty, value(filters), clear }` — and
derive the chips, the drawer's rows and steps, the active count and the
predicate from that list. Switching layouts is then a change of presentation,
and a new filter is one entry rather than a control, a row, a step index and a
count that all have to agree.

## One representation of applied state

Do not pair a visible control with a chip repeating it. Two representations of
one fact can disagree, and keeping them in step is work that buys nothing.

Chips are for state a panel has **hidden**.

Build a chip from `Badge` — a polymorphic `<span>` — with the remove button
nested inside it, and label that button for its filter (`Remove Role filter`).
Not `TagGroup`: `TagGroupItem` with `onRemove` renders its body as a toggle
button and appends the remove control *inside* it, emitting a button within a
button — invalid, and the label stays focusable. If every filter is a visible,
self-describing control, delete the chip row — `admin-01` deleted 86 lines of
per-chip clear-patch bookkeeping this way.

When filters are added on demand, derive which controls show:

```ts
visible = PERMANENT ∪ addedByHand ∪ { key | value(key) !== null }
```

That third term is load-bearing. **A filter holding a value must always show
its control**, or the table is narrowed by something invisible — the exact
failure chips were papering over. It is reachable in practice: the mobile
drawer sets filters that were never added as pills.

Two consequences:

- **New controls append.** Ordering by a descriptor table puts each new control
  in its canonical slot rather than where it was added — nowhere near the
  `+ Add filter` button just clicked. Order by insertion.
- **Any interaction pins the control.** A control showing only because it holds
  a value disappears the moment you empty it. Wrap `onChange` once rather than
  enumerating the paths — pinning only on the explicit `Clear` misses the
  commoner route of picking `All` from the list.

---

## Applied emphasis must not read as focus

`--ring` is the focus colour. A control emphasised with `ring-1 ring-ring`
looks like a control holding the keyboard, and anything bright enough to scan
a row of eight for has the same problem.

Put the signal in the value instead: an unset control renders its `All` muted
the way a placeholder does, a set one renders at full strength. Same
information, in the place you are already reading, with nothing shouting.

---

## Overriding a variant's class from a block

A block's `className` frequently loses to the component's own variants.
`Button`'s `outline` carries `dark:border-input` at **(0,2,0)**, which
out-specifies a plain `border-ring` at **(0,1,0)** — so a conditional
`active && "border-ring"` is alive in light and silently dead in dark.

Stack the variants to win in both: `data-[active]:border-ring
data-[active]:dark:border-ring` is (0,3,0).

**Measure the computed style; do not look at it.** The dead class above
rendered a visible ring, so the pill *looked* emphasised while the border it
was supposed to change was byte-identical to an unset one.

See also `design-tokens` → the `--card-spacing` case, which is the same trap
inside the library.

---

## Type scale and the control ladder

- **Table body is 14px.** 12px is what `size="sm"` switches the *whole* table
  to — body, footer and caption together. Individual cells do not opt in.
  Two exceptions carry it legitimately: a `font-mono text-muted-foreground
  text-xs` id cell, and `Badge`, which ships `text-xs` itself.
- **One visual row, one height tier.** See `design-tokens` → "One tier per
  row" for the table. Toolbar controls sit at 40px beside a 40px search field.

Guard: `e2e/control-heights.spec.ts` sweeps every block preview at 375/768/1280
and groups controls by visual row. **A new filter surface behind a nav item is
not swept until you add it** — it reached only the toolbar the original bug was
found in until Payments was added as a target.

---

## Sorting belongs in the column headers

Not in the filter row: a sort control sitting among filters reads as a filter,
and the header is where someone looks to reorder a column.

`aria-sort` goes only on columns that actually sort. `none` is correct for a
sortable column that is not the active one; **omit `sortDirection` entirely**
on the rest, because `none` claims a column sorts and is merely inactive.

An inactive column sorts descending on first click — for dates and amounts the
interesting end is the large one, and ascending makes every first click a
wasted one.

---

## A sort menu is two choices, not one

Column, separator, direction — not a flat list of every pairing. Five columns
times two directions is ten entries that grow multiplicatively; split, it is
five plus two, and changing direction no longer means finding your column again
in a list that has grown to hold both.

Every state the column headers can reach is then expressible by construction,
rather than by remembering to add the pairing to a list.

Label the directions for the column they apply to. "Ascending" is accurate and
says nothing; `A–Z`, `Newest first` and `Most first` say what you will see.
Choosing a column takes that column's natural direction — names read forwards,
counts and dates from the large end — and the direction group only appears once
a column is chosen, since two directions with nothing to order cannot act.

## Row actions go in a trailing menu, not on hover

A hover-revealed button is unreachable on touch — `focus-visible` rescues a
keyboard, not a finger — and a wide table is the likeliest to be read on a
phone. Per-row actions also accumulate; a menu absorbs a fourth and fifth where
a row of inline buttons cannot.

```tsx
<TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
…
<DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
  <MoreHorizontalIcon />
  <span className="sr-only">Actions for payment {truncateId(id)}</span>
</DropdownMenuTrigger>
```

**Name the row in the trigger's accessible label.** Ten identical "Actions"
buttons leave a screen reader to work out which row it is on from context it
does not have.

Duplicating an action that also exists inline is fine and often right: an icon
button is the fast path, the menu item is the labelled one.

## The pagination footer reports the visible range

`Showing 1–10 of 20 tickets`, in `TablePaginationInfo`.

It is not what the page status says: `Page 2 of 2` reads the same whether that
page holds ten rows or the three left over. And it is not the selection count
— `SelectionBar` already says that, at every width, where this slot is
`hidden lg:block`.

Compose the parts rather than using the props API, which only ever renders a
selection count into that slot:

```tsx
<TablePagination pageCount={pageCount} pageIndex={pageIndex}>
  <TablePaginationInfo>Showing …</TablePaginationInfo>
  <div className="flex w-full items-center gap-6 lg:w-fit lg:gap-8">
    <TablePaginationPageSize … /> <TablePaginationStatus … />
    <TablePaginationButtons … />
  </div>
</TablePagination>
```

`demos/table-pagination/composed.tsx` documents this path. Render nothing at
zero results — the empty row already says nothing matched.

---

## The mobile fold

Below `sm`, a toolbar collapses to search + a `Filters` button opening a
**bottom sheet whose body is a `Stepper`**: a menu of `label ⋯ value ›` rows
drilling into one screen per filter, with a back arrow and an Apply footer.
Filters apply live; Apply only dismisses.

A row of controls becomes a column of controls on a phone, burying the table it
filters. A scrolling column of selects is the same mistake with extra steps —
a desktop panel moved sideways.

**The drawer must hold every filter.** At that width it is the only way in, so
anything missing from it is unreachable, not merely inconvenient. `admin-01`
shipped with Action, Status and Sort reachable on no phone at all, and the e2e
case asserted the desktop dropdowns were *hidden* at 375px without checking
they were reachable anywhere else.

Drive each drawer row's value from the same descriptor the desktop control
reads, so a row and its control cannot disagree.

---

## Guards

Make every guard fail before trusting it. An assertion that passes because it
measured nothing is worse than none, and this repo has produced several:

- a `toHaveClass("h-10")` that was vacuously true on a component with the class
  unconditionally;
- a sweep that skipped the rows it existed to check, because `closest()` matches
  the element itself;
- a border assertion that would have defended the emphasis it was meant to
  remove.

So: break the thing, watch the guard fail with the message you expect, restore,
re-run. Note the verification in the commit body.

**Colour and emphasis guards run in dark mode.** That is the half where
specificity collisions live; a light-only check passes throughout.

**Dismiss popups explicitly.** A bare `Escape` pressed while a popup is still
animating open is swallowed, and the next assertion waits out its whole timeout
against a menu that never closed. Assert visible, press Escape, assert gone.
