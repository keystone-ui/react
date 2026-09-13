---
type: llm
---

PASS if the modal includes a title component (ModalTitle or equivalent),
visible or `sr-only`. It is required for accessibility.

PASS if the destructive action uses `variant="destructive"` on the Button
rather than hand-written red classes.

FAIL if the trigger is wired with `asChild` (that is Radix's API; Keystone
is Base UI and uses `render`), or if the modal has no title at all.
