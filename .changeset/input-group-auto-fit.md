---
"@keystoneui/react": minor
---

`InputGroup`: auto-fit `InputGroupButton` and `InputGroupInput` to the parent group's size.

`InputGroupButton` gains a new `auto` size variant (now the default) that pairs the button to the parent `InputGroup` automatically — 32×32 inside a `default` group, 24×24 inside a `size="sm"` group, with a 4px inset all around. Icon-only buttons (only direct child is an `<svg>`) render square automatically. Buttons inside `block-start`/`block-end` toolbars fall back to a 32px height regardless of group size.

`InputGroupInput` now reads the parent group's `size` via context and forwards it to the underlying `Input`, so a 32px `InputGroup size="sm"` no longer gets pushed open to 40px by an unsized child input. Pass `size` explicitly on `InputGroupInput` to override.

The existing `xs` / `sm` / `icon-xs` / `icon-sm` size variants on `InputGroupButton` are unchanged and remain available as escape hatches for compact chips. Consumers who explicitly pass any of those sizes are unaffected.

Behavior change for consumers using `<InputGroupButton>` with no `size` prop: the rendered button is now larger (32×32 in a default group instead of 24×24 from the previous `xs` default). Pin the old behavior with `size="icon-xs"` or `size="xs"` if needed.
