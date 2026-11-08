---
"@keystoneui/react": patch
---

Survive worst-case content and make the popup z-index scale real.

- **Popup layering**: Select, Combobox, DropdownMenu (and its submenus), Popover and Tooltip put `isolate z-50` on the Base UI Positioner, which scoped the popup's own `--z-popover` / `--z-dropdown` / `--z-tooltip` z-index to that stacking context. Every popup actually sat at 50, level with an open Modal, and a tooltip could not rise above a dropdown. The token now lives on the Positioner (`z-(--z-popover,60)` and friends), so the documented 60 / 70 scale applies.
- **Select**: a long value now ellipsizes inside the trigger instead of pushing the chevron out of it (`SelectTrigger` gains `min-w-0 max-w-full`, `SelectValue` is a block that ellipsizes). Long option labels ellipsize too: `SelectItem`'s label no longer has `shrink-0`. The popup is capped at `--available-width`.
- **Popup rows**: plain-text labels in `ComboboxItem`, `CommandItem` and the DropdownMenu items are wrapped in a span that ellipsizes, so a long email no longer overflows a fixed-height row. Rows stay 36px; for a two-line row pass `className="h-auto min-h-9 py-1.5"`.
- **Popup width**: DropdownMenu, its submenus and Popover are capped at `--available-width`, so they never grow past the viewport on a phone.
- **Pagination**: `PaginationLink` without a `size` is now an `sm` button with a square minimum (`min-w-(--ks-control-sm) px-2`) instead of a fixed `icon-sm` square, so a page like `1,284` widens the link rather than spilling out of it. An explicit `size` still wins.
- **Tag / ComboboxChip**: no longer `shrink-0`; they cap at their container (`max-w-full min-w-0`) and their text label ellipsizes while the remove button stays visible.
- **Tooltip / Breadcrumb**: unbroken strings (URLs, emails) now wrap anywhere instead of overflowing; breadcrumb items get `min-w-0`.
