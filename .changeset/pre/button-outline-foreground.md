---
"@keystoneui/react": patch
---

Outline Button text colour at rest and when disabled

At rest, the default text colour for an enabled outline Button has changed from its parent's text colour to `text-foreground`. In the FileUpload form example, the "Choose files" label now appears in the foreground colour at rest beside the muted dropzone instructions. To keep that muted look at rest, put `className="text-muted-foreground"` on the enabled Button itself.

In light and dark themes, a disabled outline Button defaults to `text-foreground/50` at rest, on hover, while pressed and with `aria-expanded="true"`. This covers the `disabled` prop, a Button disabled by a `<fieldset disabled>`, a disabled native button passed to `render`, `disabled` with `focusableWhenDisabled`, and a disabled Button rendered as a link.

Previously, the focusable and link forms defaulted to their parent's text colour at rest, and a native button with the `disabled` prop defaulted to full-strength foreground when expanded.
