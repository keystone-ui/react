---
"@keystoneui/react": minor
---

Surface popup animations + new motion and layering tokens.

- Surface popups (DropdownMenu, Select, Combobox, Popover) now animate via `data-starting-style` / `data-ending-style` for tighter Base UI alignment.
- New CSS tokens in `base.css`:
  - **Duration:** `--duration-fast`, `--duration-base`, `--duration-slow`, `--duration-drawer`
  - **Easing:** `--ease-out`, `--ease-in-out`, `--ease-drawer`
  - **Z-index:** `--z-sticky`, `--z-drawer` (40), `--z-modal` (50), `--z-dropdown`, `--z-popover` (60), `--z-tooltip` (70), `--z-toast` (80)
- Use these tokens in app code instead of hard-coded durations or z-index values. Library overlay components manage their own stacking.
