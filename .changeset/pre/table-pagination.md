---
"@keystoneui/react": minor
---

Add `TablePagination` — the footer of a paginated data table.

Rows selected, rows per page, "page N of M", and the four navigation buttons.
Props-driven for the common case, with `TablePaginationInfo` / `PageSize` /
`Status` / `Buttons` exported so `children` can compose them instead — the same
shape `Progress` already uses.

Deliberately a separate component from `Pagination` rather than an extension of
it. `Pagination` is a list of page *links* (`nav > ul > li > a`, with
`aria-current="page"`), which is right when every page has its own URL. A
data-table footer is a toolbar over an opaque page index: no per-page URLs,
`aria-live` instead of `aria-current`, and a dependency on `Select` and `Label`
— merging them would drag Base UI's Select into every bundle that only wanted
page links, and add both to `pagination`'s registry dependencies.

Two things the hand-rolled copies lacked:

- **`aria-live="polite"`** on the status and selection lines. Paging swaps the
  table's contents with no other visible confirmation, so a screen-reader user
  previously heard nothing at all after clicking "next page".
- **A `pageCount` clamp**, so an empty result set reads "Page 1 of 1" rather
  than "Page 1 of 0".

`tickets-01` now uses it instead of its own `TicketsPagination`, and the
`pagination` docs no longer carry a static "Data Table" example that claimed
per-page and total counts it did not actually render.
