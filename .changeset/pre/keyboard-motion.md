---
"@keystoneui/react": patch
---

No motion on keyboard and high-frequency surfaces, where any duration reads as lag:

- Dropdown menus (and sub-menus), Popover and Tooltip open and close instantly whenever Base UI marks the popup `data-instant`: a menu or popover opened from the keyboard or dismissed with Escape, a tooltip opened on focus, closed on press/Escape, or hopping between triggers in a delay group. Pointer opens keep their transition.
- `CommandDialog` content appears and leaves at once (it now carries `data-command`, which `base.css` keys on). The overlay keeps its short fade.
- Tabs' morphing pill and label settle without bounce (same 400ms spring, `bounce: 0`), and the label's fade runs on its own 125ms tween while its width stays on the spring.
- Focus rings on Input, InputGroup, Textarea, InputOTP, Select, NativeSelect and Tag's remove button are instant: `box-shadow` is out of their transition lists. Table rows no longer transition their hover background.
- `dashboard-01` and `admin-01` charts animate once on mount (400ms, ease-out) instead of replaying a 1.5s entrance on every legend toggle or range change, via a `useMountOnlyAnimation` hook next to `useReducedMotion`.
- `admin-01`'s sidebar toggles instantly from the ⌘B / Ctrl+B shortcut; the click path moves from `duration-200 ease-linear` to the `--duration-base` / `--ease-ks-out` tokens.
