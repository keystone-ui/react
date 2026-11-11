---
"@keystoneui/react": patch
---

Disabled Checkbox and RadioGroupItem dim outside a Field

A disabled `Checkbox` or `RadioGroupItem` now dims to 50% opacity and shows the not-allowed cursor on its own, not only inside a disabled `Field`. Base UI renders both controls as a `<span>`, which `:disabled` never matches, so the `disabled:` styles did nothing; they now key on Base UI's `data-disabled` attribute as well.

A `Label` (or `FieldLabel`) placed directly after a disabled Checkbox, RadioGroupItem or Switch now dims with it. Only the label right after its own control is affected, so in a row of options a disabled one never dims the label of an enabled one.

When the label sits next to the control inside a disabled `Field`, the control and its label stay at 50%; they do not dim twice.
