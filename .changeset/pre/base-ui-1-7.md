---
"@keystoneui/react": minor
---

Upgrade `@base-ui/react` 1.4.1 → 1.7.0.

**Public API change (minor):** `InputOTP`'s `sanitizeValue` prop is now `normalizeValue`. Base UI renamed it upstream (#4717) and `InputOTP` spreads props straight through, so a `sanitizeValue` callback will be silently ignored rather than raising an error — rename it at the call site.

```diff
- <InputOTP sanitizeValue={fn} …>
+ <InputOTP normalizeValue={fn} …>
```

Other notes:

- `InputOTP` is no longer built on a preview API. Base UI un-previewed OTP Field in 1.6.0 (`OTPFieldPreview` → `OTPField`, #5029); no keystoneui API changes as a result, since the alias was internal. With Drawer un-previewed back in 1.3.0, this library now consumes zero preview APIs.
- Across the three releases Base UI added, removed, or renamed **no** components — the exported surface is identical to 1.4.1. These were the only two breaking changes.
- Accessibility output changed in a few places upstream, all corrections rather than regressions: the `region` role moved off `Accordion.Root` to the panel where APG prescribes it (#4961), redundant ARIA attributes were dropped from `Radio.Root` (#5213), an invalid `aria-orientation` was dropped from `ToggleGroup`'s `role="group"` (#4628), and listbox separator semantics were fixed in `Select` / `Combobox` (#5399). If you assert on any of these in tests, expect to update them.
- Form behaviour: `CheckboxGroup` and `RadioGroup` now submit values matching native form submission (#5218, #5238), and `disabled` cascades from Root to Item in `Menu` / `Select` / `Combobox` (#5363, #5365).
- `input-otp` was removed from the `input-otp` registry entry's dependencies — that npm package stopped being used when the component moved to Base UI, so shadcn-CLI installs were pulling an unused package and missing `@base-ui/react`.
