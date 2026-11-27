---
"@keystoneui/react": patch
---

`Button` with `isLoading` no longer sets `aria-busy`, and it stays focusable while it loads.

- `aria-busy` is gone because JAWS can hide the contents of an element marked busy, which would take the button's name with it.
- A loading button is now unavailable through `aria-disabled` instead of the native `disabled` attribute, so it stays in the tab order. Focus is no longer lost when a pressed button starts loading. Clicks and key presses are still ignored, and it looks the same as before.
- A button that is also `disabled` stays natively disabled. Pass `focusableWhenDisabled={false}` to get the old behaviour.

For tests: a loading button is no longer matched by `toBeDisabled()`; check `aria-disabled="true"` instead. Snapshots lose `aria-busy` and the `disabled` attribute and gain `aria-disabled`.
