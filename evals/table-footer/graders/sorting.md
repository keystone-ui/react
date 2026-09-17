---
type: llm
---

PASS if sorting lives in the column headers (a sort control inside
TableHead), and `aria-sort` appears only on the columns that actually sort
-- not on every column.

PASS if the footer reports the visible range of rows.

FAIL if the footer uses the `Pagination` component. That renders page links
with their own URLs, and this table paginates an in-memory array, so the
links go nowhere.
