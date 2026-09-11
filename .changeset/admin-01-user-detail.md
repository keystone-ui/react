---
"@keystoneui/react": patch
---

`admin-01` gains a user detail view and an ID column.

Clicking a name in the users table opens a read-only record: three sections of label/value pairs built from `DescriptionList`'s new stacked two-column layout, with `CopyButton` on the id and email — the values that exist to be pasted somewhere else — and Badges for role and status so they read the same as they do in the table. A field the record does not have renders `-` rather than being dropped, so the grid keeps its alignment.

The open record is a sub-state of the Users section rather than a section of its own. A new section would need a sidebar entry, and you cannot navigate to a detail page with no record chosen. Changing section clears it, or leaving to Billing and returning would land on a stale record.

The table gains an ID column showing the real `u_01` identifier in monospace, matching how `tickets-01` renders its own. It sorts, which means the toolbar's Sort menu gains the two matching entries — that block's rule is that every sort state the headers can reach must be nameable in the menu, or the radio group ends up with nothing selected.

Block-only change; no library API is affected.
