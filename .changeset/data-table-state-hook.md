---
"@keystoneui/react": patch
---

Table state without rows in the admin-01 table files

The installed `use-data-table.ts` now also exports `useTableState`, which holds the table's filters, sort, page, page size, selection and hidden columns without any rows. `useDataTable` accepts the same config and returns the same named fields. `FilteredEmpty` takes an optional `emptyTitle`, shown when nothing is filtered in place of "No … yet". Existing copies behave as before. The files ship in `admin-01`, `users-01` and `npm/users-01`.
