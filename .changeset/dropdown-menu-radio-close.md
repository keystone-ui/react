---
"@keystoneui/react": minor
---

`DropdownMenuRadioItem` now closes the menu when picked.

Base UI defaults `closeOnClick` to `false` on both `Menu.CheckboxItem` and `Menu.RadioItem`. That is right for a checkbox group — multi-select wants the menu to stay put — and wrong for a radio group, where picking one *is* the interaction and the popup has nothing left to act on.

The visible failure was worse than a menu that lingers: Base UI keeps a fullscreen `position: fixed` backdrop with `pointer-events: auto` mounted while the popup is open, so the user's next click *anywhere on the page* is swallowed. In a filter toolbar that reads as "the second filter is broken".

`DropdownMenuRadioItem` therefore re-defaults `closeOnClick` to `true`, which is also what Radix — and so shadcn — does on select, so a ported menu behaves the way its author expects. `DropdownMenuCheckboxItem` keeps Base UI's `false`; the asymmetry is the decision.

Pass `closeOnClick={false}` to restore the previous behaviour, for a menu that reveals further controls once a choice is made.
