---
"@keystoneui/react": patch
---

`admin-01` gains a Payments section, filtered by self-describing pills.

Every filter is a pill that names its own dimension — `Action: Deposit`, not `Deposit`. A bare value turns ambiguous the moment it sits beside another one: is "Deposit" a type or a status? The exception is a value that names its own dimension; a date range reads as `Last 24h`, and `Period: Last 24h` only says it twice.

That is also why there is no chip row. Chips exist to surface filters a panel has hidden, and when the control itself says what it is and what it holds, a chip repeating it is a second representation of the same fact — two representations that can disagree. The pills are the record of what is applied.

The invariant that makes that safe lives in `visibleKeys`: a pill shows if it is one of the two permanent filters, if it was added by hand, **or if its filter holds a value**. That last term means a filter narrowing the table with no pill on the row is structurally impossible rather than merely tested for.

Two filters are permanent and the rest are added from `+ Add filter`, which offers only what is not already shown and disappears when everything is. An added pill carries its own `Remove filter`, which clears the value as it goes; setting a pill back to `All` deliberately does not remove it, because taking the control out from under the cursor mid-interaction is worse than a pill reading `All`. Ranges open a `Popover` rather than a menu — a menu is a list of choices, a pair of bounds is a small form.

Below `sm` the pills fold away and a right-hand `Drawer` carries the whole set, the same fork the users toolbar uses: a row of pills becomes a column of pills on a phone, burying the table it filters. The drawer holds *every* filter, because at that width it is the only way in.

The status filter is now one control rather than one per payment type. The split was what produced the "Mixed statuses" fallback, and expressing it cost a pill that could read something no one asked for.

Block-only change; no library API is affected.
