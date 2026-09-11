# Data tables

Composing a filterable table: the toolbar, applied state, sorting, the footer,
and what happens on a phone.

`admin-01` and `tickets-01` implement all of this. Installing one is faster and
more reliable than rebuilding it — `npx shadcn@latest add
https://keystoneui.io/r/admin-01.json`.

## Contents

- Filter controls name the dimension they act on
- One representation of applied state
- Applied emphasis must not read as focus
- Overriding a component's variant class
- Table type scale and the control ladder
- Sorting belongs in the column headers
- The pagination footer reports the visible range
- The mobile fold

---

## Filter controls name the dimension they act on

A trigger reads `Status: All`, never `All Statuses`. Dimension muted, value at
full strength.

```tsx
<DropdownMenuTrigger render={<Button variant="outline" />}>
  <span className="font-normal text-muted-foreground">Status:</span>
  {statusLabel(value)}
</DropdownMenuTrigger>
```

A bare value turns ambiguous the moment it sits beside another. `Deposit` next
to `All statuses` is one control naming a value with no dimension and the next
naming a dimension with no value — you cannot tell from either what it filters.

**Exception:** a value that names its own dimension takes no label. A date range
reads `Last 24h`; `Period: Last 24h` says it twice.

**Corollary:** once the trigger says `Status:`, the option list says `All`, not
`All Statuses`.

**Not every trigger is a filter.** `Table options`, `Filters`, `Add filter` name
a menu rather than report a value, and take no label. The test is whether the
trigger's text changes with state.

## One representation of applied state

Do not pair a visible control with a chip repeating it. Two representations of
one fact can disagree, and keeping them in step buys nothing.

Chips are for state a panel has **hidden**. If every filter is a visible,
self-describing control, there is nothing for a chip to add.

When filters are added on demand, derive which controls show:

```ts
visible = PERMANENT ∪ addedByHand ∪ { key | value(key) !== null }
```

The third term is load-bearing: **a filter holding a value must always show its
control**, or the table is narrowed by something invisible. It is reachable in
practice — a mobile drawer sets filters that were never added on desktop.

Two consequences:

- **New controls append**, in the order added. Ordering by a static descriptor
  list puts each new control in its canonical slot instead of next to the
  `+ Add filter` button just clicked.
- **Any interaction pins the control.** One showing only because it holds a
  value disappears the moment it is emptied. Wrap the change handler once rather
  than enumerating paths — pinning only on an explicit `Clear` misses the
  commoner route of picking `All` from the list.

## Applied emphasis must not read as focus

`--ring` is the focus colour. A control emphasised with `ring-1 ring-ring` looks
like one holding the keyboard — and anything bright enough to scan a row of
eight for has the same problem.

Put the signal in the value: an unset control renders its `All` muted the way a
placeholder does, a set one renders at full strength.

## Overriding a component's variant class

Your `className` frequently loses to the component's own variants. `Button`'s
`outline` carries `dark:border-input` at **(0,2,0)**, which out-specifies a
plain `border-ring` at **(0,1,0)** — so a conditional `active && "border-ring"`
works in light mode and is silently dead in dark.

Stack the variants so yours wins in both:

```tsx
// (0,3,0) — beats dark:border-input
"data-[active]:border-ring data-[active]:dark:border-ring"
```

Check the computed style rather than the rendering. In the case above the
element still showed a ring, so it *looked* emphasised while the border it was
meant to change was identical to an unset control's.

## Table type scale and the control ladder

- **Table body text is 14px.** 12px is what `size="sm"` switches the whole table
  to — body, footer and caption together. Individual cells do not opt in. Two
  exceptions carry it legitimately: a `font-mono text-muted-foreground text-xs`
  id cell, and `Badge`, which ships `text-xs` itself.
- **One visual row, one height tier.** Toolbar controls sit at 40px (`default`)
  beside a 40px search field. Mixing `sm` (32px) with `default` in one row is
  the most common visual defect in a toolbar. See [styling.md](./styling.md).

## Sorting belongs in the column headers

Not in the filter row — a sort control among filters reads as a filter, and the
header is where someone looks to reorder a column.

```tsx
<TableHead sortDirection={active ? direction : null}>
  <TableSortButton direction={active ? direction : null} onClick={…}>
    Amount
  </TableSortButton>
</TableHead>
```

`aria-sort` goes only on columns that actually sort. `null` renders
`aria-sort="none"`, which is correct for a sortable column that is not the
active one — **omit `sortDirection` entirely** on columns that do not sort, or
they claim to sort and merely be inactive.

Sort an inactive column descending on first click: for dates and amounts the
interesting end is the large one, and ascending makes every first click wasted.

## The pagination footer reports the visible range

`Showing 1–10 of 20 tickets`, in `TablePaginationInfo`.

That is not what the page status says — `Page 2 of 2` reads the same whether
that page holds ten rows or the three left over. Nor is it the selection count,
which `SelectionBar` already reports at every width, where this slot is
`hidden lg:block`.

The props API only ever renders a selection count into that slot, so compose the
parts:

```tsx
<TablePagination pageCount={pageCount} pageIndex={pageIndex}>
  <TablePaginationInfo>Showing 1–10 of 20 tickets</TablePaginationInfo>
  <div className="flex w-full items-center gap-6 lg:w-fit lg:gap-8">
    <TablePaginationPageSize onValueChange={setPageSize} value={pageSize} />
    <TablePaginationStatus pageCount={pageCount} pageIndex={pageIndex} />
    <TablePaginationButtons
      onPageIndexChange={setPageIndex}
      pageCount={pageCount}
      pageIndex={pageIndex}
    />
  </div>
</TablePagination>
```

Render nothing at zero results — the empty row already says nothing matched.

## The mobile fold

Below `sm`, collapse the toolbar to search plus a `Filters` button opening a
**bottom-sheet `Drawer` whose body is a `Stepper`**: a menu of `label ⋯ value ›`
rows drilling into one screen per filter, with a back arrow and an Apply footer.
Filters apply live; Apply only dismisses.

A row of controls becomes a column of controls on a phone, burying the table it
filters. A scrolling column of selects is the same mistake with extra steps — a
desktop panel moved sideways.

**The drawer must hold every filter.** At that width it is the only way in, so
anything missing from it is unreachable, not merely inconvenient. Drive each row
from the same descriptor the desktop control reads, so a row and its control
cannot disagree.

Both blocks implement this — see `admin-01`'s `payment-filters-drawer.tsx` or
`tickets-01`'s `tickets-filters-drawer.tsx` after installing.
