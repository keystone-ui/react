---
"@keystoneui/react": patch
---

`admin-01` gains full filter parity with `tickets-01`, desktop and mobile.

The users toolbar now forks at `sm:` the way `tickets-01` does: search is shared and always visible, the filter cluster is `hidden sm:flex`, and below that a single Filters button opens a bottom-sheet `Drawer` whose body is a `Stepper` — a menu of "label + current value" rows drilling into one `RadioGroup` per filter. The fork is CSS-only, so both trees are always mounted and there is no `useMediaQuery` to get wrong on the server. Previously the block had no mobile story at all; its three controls simply wrapped onto separate lines.

A Sort control joins Role and Status, and it drives the **same** state the column headers write — picking "Name Z–A" moves the header arrow, and clicking a header updates the menu's label, with no syncing code. `tickets-01` runs two independent sort systems, where its column sort cannot be seen or cleared from its toolbar; this is the better shape.

Every control in the row now sits on the 40px `default` tier. The block previously paired `size="sm"` buttons with a default-height `InputGroup`, an 8px mismatch.

Block-only change; no library API is affected.
