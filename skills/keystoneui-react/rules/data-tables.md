# Data tables

Composing a filterable table: the toolbar, applied state, sorting, the footer,
and what happens on a phone.

`admin-01` and `tickets-01` implement all of this. Installing one is faster and
more reliable than rebuilding it — `npx shadcn@latest add
https://keystoneui.io/r/admin-01.json`.

## Contents

- Filter controls name the dimension they act on
- Two filter layouts, and how to choose
- View controls sit apart from the filters
- Loading keeps the table's shape
- One representation of applied state
- Applied emphasis must not read as focus
- Overriding a component's variant class
- Table type scale and the control ladder
- The column headers sort; a Sort menu may join them
- A sort menu is two choices, not one
- Row actions go in a trailing menu, not on hover
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

## Two filter layouts, and how to choose

**Inline pills** — every filter a control on the toolbar, each naming its own
dimension. **Drawer and chips** — all filters behind one `Filters` button, with
the applied ones as removable `Key: value` chips underneath.

| | drawer + chips | inline pills |
|---|---|---|
| change a filter | 3–4 clicks | 2 |
| remove one | 1 click on its ✕ | 1, on the pill's ✕ |
| read what is applied | the chip row is the answer | the pills are the answer |
| see what is filterable | open the drawer | already on screen |
| desktop vs mobile | one surface | two, kept in step by a shared descriptor |

**Default to pills.** An admin table is one someone sits in front of, flipping a
filter at a time while they work, and pills make that two clicks with nothing to
open. Start the row with the two most common filters and offer the rest from
`+ Add filter`, so six filters do not wrap before anyone has used one; a filter
that holds a value always shows its pill, so applied state is never invisible.
`admin-01` implements this on both of its tables.

Drawer and chips remain the better fit for a table filtered once and then read,
or one with more filters than a row can hold even on demand. Its shell should
suit its width — a bottom sheet on a phone, a side panel on a desktop — and,
since `swipeDirection` is a prop rather than a class, render it twice behind a
CSS fork with one copy out of the accessibility tree rather than switching it at
runtime.

**Both are renderings of one model.** Whichever you pick, declare each filter
once as a descriptor — `{ key, label, empty, value(filters), clear }` — and
derive the pills or chips, the drawer's rows and steps, the active count, the
URL and the predicate from that list. Switching layouts is then a change of
presentation, and a new filter is one entry rather than a control, a row, a step
index and a count that all have to agree. It is also what keeps the phone
drawer in step with the pills: `admin-01` once shipped three filters reachable
on no phone at all, before both were driven from one list.

## View controls sit apart from the filters

`Columns`, `Export` and `Sort` change how the rows are shown, not which rows, so
put them at the far end of the toolbar, each naming itself. Give search a
minimum width so a full row wraps this group onto a second line instead of
crushing the field.

- **Columns** lists only what can go: the id or name, the selection checkbox and
  the row actions identify and act on a row, so they stay. Checkbox items with
  `closeOnClick={false}`, so hiding three columns is one visit. It is a view
  preference — keep it out of the URL.
- **Export** writes every row the filters and sort produce, not the current
  page, as raw values — the stored amount rather than `10,000.00`, whose comma a
  spreadsheet misreads; ids rather than labels; an empty cell rather than a
  dash.
- **The query belongs in the URL** — search, filters, sort, page, page size —
  written with `replaceState` (not `pushState`, or every keystroke is a Back
  step), defaults left out, and read back value by value with a fallback, since
  a URL is input anyone can edit.

## Loading keeps the table's shape

While a request is in flight, set `aria-busy` on the table and render skeleton
rows at the real rows' height — including the 32px row-actions box and any
two-line cell — in the count the previous page had. Keep the footer describing
the last answer rather than collapsing it to zero. Rows that change height or
number when the data lands make the page jump under the pointer.

## One representation of applied state

Do not pair a visible control with a chip repeating it. Two representations of
one fact can disagree, and keeping them in step buys nothing.

Chips are for state a panel has **hidden**.

Build a chip from `Badge` — a polymorphic `<span>` — with the remove button
nested inside it, and label that button for its filter (`Remove Role filter`).
Not `TagGroup`: `TagGroupItem` with `onRemove` renders its body as a toggle
button and appends the remove control *inside* it, emitting a button within a
button — invalid, and the label stays focusable. If every filter is a visible,
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
- **One visual row, one height tier.** A data-table toolbar uses `size="sm"`
  (32px) on every control, search field included, matching the 32px
  `TablePagination` in the same card. Mixing `sm` with `default` in one row is
  the most common visual defect in a toolbar. See [styling.md](./styling.md).
- **The header is on the ladder; body rows are not.** `TableHead` is a fixed
  40px (32px at `size="sm"`). A body row is its cell padding plus its tallest
  content plus a 1px divider: 37px for text, 49px with the `icon-sm` row-actions
  trigger, more for a two-line cell. A 40px header over 49px rows is the
  intended shape — `table-actions` in the docs and shadcn's own data table are
  the same — so do not force the rows to the header's height.
- **Size in-row controls to the table.** At `size="sm"` the padding is 6px, so a
  32px control makes a 45px row: taller than a default table's text rows, with
  the text shrunk to 12px for nothing. A compact table that needs controls uses
  `icon-xs` / `xs` (37px rows); a table whose rows need `icon-sm` stays at the
  default size.

## The column headers sort; a Sort menu may join them

The header is where someone looks to reorder a column, so sortable columns
always carry a `TableSortButton`. A toolbar `Sort` menu is an addition, not a
replacement — it can name an order a header arrow cannot (`Newest first`), and
it is the only way to sort on a phone, where the headers scroll out of reach. If
you add one, set it apart from the filters (the far end of the row, labelled
`Sort:`) so it does not read as one more filter, and have it write the same
`sort` state the headers do, so a header click moves the menu's check.

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

Sort an inactive column in its natural direction on first click — dates and
amounts descending, where the interesting end is the large one; names A–Z — and
use the same default when the column is picked from a Sort menu, so the two
handles agree on what choosing a column means.

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

Both blocks implement this — see `admin-01`'s `payment-filters-drawer.tsx` and
`admin-filters-drawer.tsx`, or `tickets-01`'s `tickets-filters-drawer.tsx`,
after installing.

---

## Incorrect / Correct

Every rule in this file was a defect before it was a rule. These are the four
that shipped more than once.

### The footer of a data table

`Pagination` renders page *links*, each with its own URL. A data table paginates
a client-side slice, so those links go nowhere.

**Incorrect:**

```tsx
<Pagination>
  <PaginationPrevious href="#" />
  <PaginationItem href="#">1</PaginationItem>
  <PaginationNext href="#" />
</Pagination>
```

**Correct** — `TablePagination` reports the visible range and owns rows-per-page:

```tsx
<TablePagination
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  page={page}
  pageSize={pageSize}
  total={rows.length}
/>
```

### Filter triggers name their dimension

A bare value is ambiguous the moment a second filter sits beside it — "All"
next to "All" tells the reader nothing.

**Incorrect:**

```tsx
<SelectTrigger>All Statuses</SelectTrigger>
<SelectTrigger>All Priorities</SelectTrigger>
```

**Correct:**

```tsx
<SelectTrigger>Status: All</SelectTrigger>
<SelectTrigger>Priority: All</SelectTrigger>
```

A filter whose value names its own dimension — a date range — takes no label.

### One representation of applied state

**Incorrect** — the control and a chip both report the same filter, so clearing
one leaves the other stale:

```tsx
<Select value={status}>…</Select>
{status !== "all" && <Tag onRemove={clearStatus}>Status: {status}</Tag>}
```

**Correct** — the control *is* the state; it always shows its own value:

```tsx
<Select value={status}>…</Select>
```

Reach for chips only when the controls are hidden behind a drawer, and then the
chips are the only representation, not a second one.

### `aria-sort` belongs only on sortable columns

**Incorrect** — announcing every column as sortable, including the ones that
are not:

```tsx
{columns.map((col) => (
  <TableHead aria-sort={sort.key === col.key ? sort.dir : "none"} key={col.key}>
    {col.label}
  </TableHead>
))}
```

**Correct:**

```tsx
{columns.map((col) => (
  <TableHead
    aria-sort={
      col.sortable ? (sort.key === col.key ? sort.dir : "none") : undefined
    }
    key={col.key}
  >
    {col.sortable ? (
      <TableSortButton onClick={() => toggleSort(col.key)}>
        {col.label}
      </TableSortButton>
    ) : (
      col.label
    )}
  </TableHead>
))}
```
