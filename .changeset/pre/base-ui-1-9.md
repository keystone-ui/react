---
"@keystoneui/react": patch
---

Upgrade `@base-ui/react` 1.8.0 → 1.9.0. No keystoneui API changes; Base UI added, removed, or renamed no components.

Behaviour changes inherited from upstream:

- `AccordionTrigger` (and Collapsible triggers) now render the native `disabled` attribute instead of `aria-disabled` when disabled (#5607). If you assert `aria-disabled="true"` in tests, switch to `toBeDisabled()`.
- Select / Combobox / Autocomplete: automatic popup unmounting is no longer tied to `actionsRef` (#5734). Call `eventDetails.preventUnmountOnClose()` in `onOpenChange` to keep the popup mounted after close.
- Checkbox, Radio Group and Switch prefer `aria-label` over an associated `<label>` for the accessible name (#5787).
- Scroll Area's viewport no longer has `role="presentation"` (#5813).
- Many fixes for Drawer on iOS (virtual keyboard spacing, swipe velocity on 120 Hz input), Menu/Popover focus-guard loops, and faster mounting for large Select/Combobox lists.
