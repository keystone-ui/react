---
"@keystoneui/react": minor
---

`Table` gains sortable headers, numeric columns, `TableEmpty`, and access to its
scroll container.

**`TableSortButton` + `TableHead sortDirection`.** `aria-sort` belongs on the
`th` per ARIA, so it stays on `TableHead` while the button is only the
affordance. `sortDirection` is three-way, which is what hand-rolled sort headers
usually get wrong: omitted emits no attribute (the column is not sortable),
`null` emits `aria-sort="none"` (sortable but inactive), and `"asc"`/`"desc"`
mark the active column. Emitting `"none"` on a column that cannot be sorted
tells a screen-reader user that it can be.

`TableSortButton` is polymorphic via `render`, so one component serves both a
client-state table (`onClick`) and a server-rendered one whose sort state lives
in the URL (`render={<Link href={…} />}`). The inactive marker stays visible by
default — that is what distinguishes the sortable columns from the ones that are
not, and a hover-only affordance is invisible to touch; `revealOnHover` opts
into hiding it.

**`numeric` on `TableHead` and `TableCell`** right-aligns with tabular figures,
using `text-end` rather than `text-right` so the column flips with the writing
direction.

**`TableEmpty`** provides the `tr`/`td` plumbing for a "no rows" row and
suppresses the row hover, so it is not mistaken for a selectable row. `colSpan`
is required rather than derived: counting header cells would need a context the
header does not populate, and would be wrong the moment columns are
conditionally hidden.

**`containerClassName` / `containerProps`** expose the scroll container, which
was previously unreachable. That is also how you get a sticky header: the
container pins `overflow-y` to `hidden` on purpose (an implicit promotion to
`auto` renders a permanent vertical gutter inside every table on macOS with
"Show scrollbars: Always"), so a scrolling viewport is opt-in and needs a height
cap. A header that sticks to the *page* scroll remains impossible while `Table`
owns the horizontal scroll wrapper — documented rather than left to be
discovered.
