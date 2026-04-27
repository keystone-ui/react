---
"@keystoneui/react": patch
---

Fix portaled popups (DropdownMenu, Select, Combobox, Popover) so they sit above modals and drawers.

Previously a Select inside a Modal could be visually trapped under the modal overlay. Popups now sit at `z=60`, above modal (`50`) and drawer (`40`), below tooltip (`70`) and toast (`80`).
