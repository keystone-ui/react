---
"@keystoneui/react": minor
---

Add `CopyButton`, and give `DescriptionList` a record layout.

Between them these make a read-only detail view possible. The library had no way to build one: no block in the repo is a record view, and `DescriptionList` — the right primitive semantically, being a real `dl`/`dt`/`dd` — could render exactly one shape, `label ·········· value` on a single row with the value right-aligned. That reads as a summary. A record page wants the label above the value, in two columns.

**`DescriptionList` gains `orientation`.** `orientation="stacked"` puts the term above the details, drops the row padding and separators — row-list affordances that read as noise between stacked pairs — and spaces the rows, since nothing else would. One prop, because it restyles three sub-parts at once; decorating every row from the call site is not a real alternative.

Columns deliberately stay in `className`. A multi-column record is four classes on the element you already style, `grid` supersedes the component's default `flex`, and the stacked row gap survives alongside your own `gap-x-*`. Layout belongs at the call site here.

Both default to today's behaviour, and that is verified rather than asserted: across all six existing demos — 85 elements — no class was removed and no element changed size. Only inert `group-data-[orientation=stacked]` classes were added.

**`CopyButton`** copies a value and confirms it, pairing with a value rather than wrapping it so it composes beside a monospace ID, inside an `InputGroup`, or in a table cell. The affordance is trivial; the reason it is a component is that the hand-rolled version was not. The same snippet appeared five times in this repo, and every copy shared three defects: the reset timer was never cleared, so a click followed by an unmount set state on a dead component; `writeText` was not awaited, so a rejection surfaced as an unhandled promise; and the failure path showed a tick anyway. Clipboard writes fail whenever the document is unfocused or the origin is insecure, and a false confirmation is worse than none — the user finds out when they paste.

Confirmation is carried by the accessible name, `Copy` → `Copied`; an icon swap announces nothing. Size and variant pass through to `Button`.
