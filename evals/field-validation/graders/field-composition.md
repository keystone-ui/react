---
type: llm
---

PASS if the form uses FieldGroup and Field for layout, with FieldLabel tied
to each control, and reports the error with FieldError (or ErrorMessage from
the lightweight `/form` pattern).

FAIL if validation state is put on Field as `data-invalid` -- that is a
shadcn API and styles nothing in Keystone UI.

FAIL if the layout is raw `<div>` elements with `space-y-*` spacing, or the
error message is rendered with FieldDescription instead of FieldError.
