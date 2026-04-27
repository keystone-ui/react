---
"@keystoneui/react": patch
---

Touch-target and a11y polish across primitives.

- `Button` now has an explicit transition list (`transform`, `background-color`, `color`, `border-color`, `box-shadow`, `outline-color`) instead of `transition-all`, and defaults to `type="button"` to prevent accidental form submission inside `<form>`.
- AAA-leaning touch-target extension on Toast, Drawer dismiss, InputOTP slot, and other primitives — visual unchanged, hit area larger.
- Safe-area-inset polish for Toast and Drawer on mobile.
