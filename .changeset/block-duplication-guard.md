---
"@keystoneui/react": patch
---

`admin-01`'s two filter drawers now share their parts, and a test reports the next copy.

An audit found six components declared more than once across the blocks — `SubHeader` three times byte-identical, `ResultSummary` three times, `FilterMenu`, `Options`, `FilterOption` and `Bound` besides — along with a 110-character class string written out verbatim in three files. Nothing had ever reported any of it: `block-shared-files.test.ts` compares duplicated *file basenames*, because its subject is install collision, and every one of these lives in a differently-named file.

`block-duplication.test.ts` compares symbols instead, and sanctions two remedies rather than one. A block may share a part *within itself* — a block installs as one unit, so a file there collides with nothing — or it may record that the duplication is correct, because blocks are copy-paste starters and one that owns its own presentation is working as intended. A guard whose only escape is "promote it into the library" would ratchet the API upward forever, which is what the audit set out to stop.

Four of the six are now shared inside `admin-01`. The remaining two are allowlisted with reasons: `ResultSummary` is two lines of arithmetic where `TablePaginationInfo` already accepts `children`, and `TriggerLabel` is a one-line span.

No library API changed.
