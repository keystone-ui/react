---
"@keystoneui/react": minor
---

Put `Toggle` and `ToggleGroup` on the shared control height ladder.

`Toggle` resolved `default` to 36px while `Button`, `Input`, `InputGroup`, `SelectTrigger` and `NativeSelect` all resolve it to 40px, so a toolbar left at its defaults was a 4px mismatch by construction. That 36px was not a decision: it is shadcn's `new-york-v4` ladder, inherited when the component was reworked a day after it was added and never revisited, while its padding *was* tuned to keystone's taste. The documented rationale — that 36px "matches the popup item height, which is right for menu-like toggles" — described a case that has never existed; no toggle in this library is rendered inside a menu.

**The ladder is now `xs` 24px · `sm` 32px · `default` 40px · `lg` 48px**, and Toggle sits on it:

| | before | after |
| --- | --- | --- |
| `sm` | 32px | 32px |
| `default` | 36px | **40px** |
| `lg` | 40px | **48px** |

**If you used `size="lg"` to line a ToggleGroup up with a default Button, drop the prop** — the defaults now match, and `lg` is 48px. Padding is unchanged, because it sets an icon-only toggle's width; `min-w` follows the height, so an icon-only toggle is 40×40 at `default` and 48×48 at `lg`.

Toggle's base radius also moves from `rounded-md` to `rounded-lg`, matching Button. With the heights aligned, a 2px corner difference was the remaining visible mismatch. Joined `ToggleGroupItem`s are unaffected — they already force `rounded-l-lg`/`rounded-r-lg` — so this shows on standalone toggles and groups with `spacing > 0`.

Note `lg` keeps `text-sm` where Button's `lg` is `text-base`: the heights align, the type does not.

36px remains the popup item tier (`POPUP_ITEM_HEIGHT`), which is deliberately off the control ladder and has its own density switch via `size="compact"`. `control-ladder.test.tsx` now pins the whole ladder and fails if any component declares a bare `h-9`.
