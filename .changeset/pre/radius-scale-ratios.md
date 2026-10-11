---
"@keystoneui/react": minor
---

The radius scale is derived by ratio instead of by pixel offset.

```diff
- --radius-sm: calc(var(--radius) - 4px);   --radius-xl:  calc(var(--radius) + 4px);
+ --radius-sm: calc(var(--radius) * 0.6);   --radius-xl:  calc(var(--radius) * 1.4);
```

**If you have not changed `--radius`, nothing moves.** At the `0.625rem`
default both spellings give the same seven values — 6/8/10/14/18/22/26px —
which is where the multipliers come from. `apps/docs/e2e/radius-scale.spec.ts`
pins that.

**If you have, your corners change.** Offsets stop being proportional as soon
as the base moves, and the further it moves the worse it gets. Three of the
four presets `/theme-builder` ships are affected:

| `--radius` | sm | md | lg | xl | 2xl | 3xl | 4xl |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `0` before | **-4** | **-2** | 0 | 4 | 8 | 12 | **16** |
| `0` after | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `0.875rem` before | 10 | 12 | 14 | 18 | 22 | 26 | 30 |
| `0.875rem` after | 8.4 | 11.2 | 14 | 19.6 | 25.2 | 30.8 | 36.4 |

The `0` row is the bug this fixes: the "sharp" preset never produced a square
corner, because `--radius-4xl` stayed at 16px however far you turned the dial
down, and `--radius-sm` went negative. Ratios also mean the scale no longer
mixes units — `calc(rem - px)` diverged from `calc(rem * n)` at any root font
size other than 16px, so a reader who had enlarged their browser text got a
subtly different scale from everyone else.

It is the scale shadcn uses, so a project mixing both registries now has one
set of corners rather than two.

Two component-level offsets moved with it, both unchanged at the default:
`InputGroupAddon`'s nested `kbd` (`calc(var(--radius) - 5px)` →
`calc(var(--radius) * 0.5)`, 5px either way) and `Calendar`'s cell radius
(`- 2px` → `* 0.8`, 8px either way). `ToggleGroup`'s
`min(var(--radius-md), 10px)` was audited and left alone — the 10px ceiling
guards against an oversized corner on a 32px control and is independent of the
scale.

**On the bump.** `minor` rather than `major` because the default is untouched
and the change is corrective everywhere else: every value it alters was one the
old formula got wrong. In pre mode the type is banked until `changeset pre
exit`, so this is a decision about 1.1.0 versus 2.0.0, not about the next beta.
If you have themed `--radius` and want the old geometry, the seven offset
expressions above still work — set them in your own `@theme inline` block.
