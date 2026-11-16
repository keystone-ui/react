---
"@keystoneui/react": patch
---

Add package flavours of users-01 and filter-pills

For apps that use the `@keystoneui/react` package instead of vendored components: `r/npm/users-01.json` and `r/npm/filter-pills.json` install the same files, importing `@keystoneui/react/*`. `npm/users-01` needs 1.0.0-beta.11 or later; `npm/filter-pills` is tested with 1.0.0-beta.11. Both need a `components.json`. Existing items are unchanged.
