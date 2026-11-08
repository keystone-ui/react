---
"@keystoneui/react": patch
---

Toast fixes for phones and for close callbacks:

- Centred toasts (`top-center`, `bottom-center`) no longer render half off-screen on phones; the centring translate now applies from `sm` up only. On desktop they are truly centred again (the viewport's 16px margin used to shift them right).
- The viewport is placed with safe-area-aware offsets (`max(1rem, env(safe-area-inset-*))`, `0.5rem` side gutters below `sm`) instead of a margin plus padding that the absolutely positioned toasts ignored, so toasts clear the notch and home indicator.
- Toasts swipe toward the edge they sit on: top positions swipe up, left positions swipe left, centred positions only vertically. Previously every toast swiped down or right.
- `onDismiss` and `onAutoClose` are no longer mutually exclusive. The close button, `cancel`, `action` and `toast.dismiss()` call `onDismiss`; the duration running out calls `onAutoClose` (falling back to `onDismiss`). Swipe and Escape are unattributed and follow the auto-close path. Before, setting both meant `onDismiss` never fired and `onAutoClose` fired on manual closes too.
- The `action` button now closes the toast after running its `onClick`, like `cancel`.
- Exits run at 0.6x the enter time, and a swiped toast finishes on `--duration-slow`; opacity eases on `--ease-ks-out`.
- Long unbroken descriptions (URLs, ids) wrap instead of overflowing, and the `action`/`cancel` buttons get a 44px-tall tap area.
