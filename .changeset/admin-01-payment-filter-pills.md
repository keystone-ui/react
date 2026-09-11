---
"@keystoneui/react": patch
---

`admin-01` gains a Payments section, filtered by self-describing pills.

Every filter is a pill that names its own dimension — `Action: Deposit`, not `Deposit`. A bare value turns ambiguous the moment it sits beside another one: is "Deposit" a type or a status? The exception is a value that names its own dimension; a date range reads as `Last 24h`, and `Period: Last 24h` only says it twice.

That is also why there is no chip row. Chips exist to surface filters a panel has hidden, and when the control itself says what it is and what it holds, a chip repeating it is a second representation of the same fact — two representations that can disagree. The pills are the record of what is applied.

The invariant that makes that safe lives in `visibleKeys`: a pill shows if it is one of the two permanent filters, if it was added by hand, **or if its filter holds a value**. That last term means a filter narrowing the table with no pill on the row is structurally impossible rather than merely tested for.

Two filters are permanent and the rest are added from `+ Add filter`, which offers only what is not already shown and disappears when everything is. A multi-select names its first value and counts the rest — `Currency: BTC, +2` — because a bare `3` says how many without saying which. Each menu's footer spells that number out and offers a `Clear`, and exists only while the filter holds something — an empty filter has no count to report and nothing to undo. A pill is never removed from inside its own menu: setting one back to `All` leaves it on the row deliberately, and an empty pill has nothing `Clear all` does not already handle. Ranges open a `Popover` rather than a menu — a menu is a list of choices, a pair of bounds is a small form.

Sorting is not in the filter row. The column headers own it, exactly as the users table does it: a sort control sitting among filters reads as a filter. Four columns sort and carry `aria-sort`; the other four carry none, because `none` would claim a column sorts and is merely inactive.

Below `sm` the pills fold away and a bottom-sheet `Drawer` carries the whole set — the same `Stepper` drilldown the users drawer uses, a menu of "label + current value" rows opening one screen per filter. A row of pills becomes a column of pills on a phone, and a scrolling column of selects is just a desktop panel moved sideways. Each row's value comes from the same descriptor the pills read, so a row and its pill cannot disagree. The drawer holds *every* filter, because at that width it is the only way in.

The status filter is now one control rather than one per payment type. The split was what produced the "Mixed statuses" fallback, and expressing it cost a pill that could read something no one asked for.

Block-only change; no library API is affected.
