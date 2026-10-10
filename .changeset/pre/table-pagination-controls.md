---
"@keystoneui/react": patch
---

`TablePagination` exports the grouping its right-hand controls sit in.

`TablePagination` accepts `children` to replace its default composition, and five of its six structural elements were already named, `data-slot`-bearing parts. The sixth — the wrapper holding the page size, the status and the buttons — was a bare `div`, so anyone taking the composition path had no way to reproduce it except by copying `flex w-full items-center gap-6 lg:w-fit lg:gap-8`. All three blocks in this repo had copied it verbatim.

`TablePaginationControls` names it, with `data-slot="table-pagination-controls"`. No props, no behaviour, no new dependency — it makes the compound complete rather than larger. The default composition renders exactly what it did before, which is what the test asserts.
