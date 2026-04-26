---
"@keystoneui/react": patch
---

Motion and touch polish across primitives:

- Modal/AlertDialog/Popover/Dropdown/Select/Combobox/Tooltip now scale from 0.95 (was 0.96), exact match to Emil's "scale-from-0" principle.
- Modal and AlertDialog overlays now exit at 100ms (was 125ms) so the backdrop doesn't linger past content.
- Accordion chevron picks up an explicit `duration-200 ease-out` to match its sibling panel.
- Switch root + thumb get explicit `duration-150` (was inheriting Tailwind defaults).
- Input gets explicit `duration-150` and `aria-invalid:transition-none` so validation flips don't crossfade through the focus transition.
- Badge's `<a>` link variants now crossfade their hover via `[a]:transition-colors` instead of snapping.
- Checkbox / Switch / RadioGroupItem hit-area extension bumped from `-inset-x-3 -inset-y-2` to `-inset-x-4 -inset-y-3` for AAA-leaning touch targets without changing the visual.
