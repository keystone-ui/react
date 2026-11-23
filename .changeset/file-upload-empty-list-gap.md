---
"@keystoneui/react": patch
---

FileUpload: an empty list no longer adds a gap under the dropzone

An empty `FileUploadList` no longer adds a gap beneath the dropzone (12px with the default spacing). While it has no rows the list is visually hidden (`sr-only`) instead of a 0px flex item: it stays in the DOM, with its `ref`, `role="list"` and your `className`, and stays exposed to assistive technology, so its accessible name and references to it remain available while it is empty. To keep the old gap, add `empty:not-sr-only` to its `className`. A negative margin you added to cancel the gap can go. With files, the list's layout is unchanged.
