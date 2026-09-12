---
"@keystoneui/react": minor
---

Put every control on one corner radius: `rounded-md`, stepping to `rounded-sm` at the 24px rung.

`Button`, `Toggle`, `ToggleGroup` and `ButtonGroup` were `rounded-lg` (10px) while `Input`, `InputGroup`, `SelectTrigger`, `NativeSelect` and `Textarea` were already `rounded-md` (8px). Every toolbar in the library therefore paired an 8px search field with 10px buttons. `bf72601` aligned Toggle to Button and fixed the mismatch it was looking at; this one closes the half it left open. It also matches shadcn, whose Button and Input are both `rounded-md` at the same `--radius: 0.625rem` default.

| rung | height | before | after |
| --- | --- | --- | --- |
| `xs` / `icon-xs` | 24px | 10px | **6px** (`rounded-sm`) |
| `sm` / `icon-sm` | 32px | 10px | **8px** (`rounded-md`) |
| `default` / `icon` | 40px | 10px | **8px** |
| `lg` / `icon-lg` | 48px | 10px | **8px** |

**Nothing to change in your code** — no prop, no export and no class name moves. If you deliberately matched a custom control to keystone's buttons with `rounded-lg`, switch it to `rounded-md`.

The `xs` step-down is geometric, not a new ladder: at 10px a 24px-tall button has 4px of straight edge per side and its corner arcs nearly meet, which reads as a lozenge. `icon-xs` was worse, being 4px of straight edge on both axes. `InputGroupButton` already shipped `xs: rounded-sm` / `sm: rounded-md`, so this generalises a rule the library already had in one place rather than inventing one.

**Two latent bugs go with it.** A joined `ToggleGroup` at `size="sm"` clamped its container to 8px while its first and last items stayed at `rounded-l-lg`/`rounded-r-lg` — the item corners overhung the group by 2px. And `ButtonGroup` forced 10px end caps with `!important` onto children that were 8px (`Input`, `SelectTrigger`, `ButtonGroupText`), papering over a mismatch it was creating. Both now agree by construction.

**Surfaces are unchanged.** `Card`, `Modal`, `Popover`, `Toast`, `Alert`, `Item`, `AccordionItem` and the popup containers keep `rounded-lg`/`rounded-xl` — they are not controls, and shadcn makes the same split. So do containers whose children are *inset* by padding: `TabsList` stays `rounded-lg` around its `rounded-md` triggers, and `SelectionBar` stays `rounded-2xl`. Flattening those would push the inner corners past the container.

`control-ladder.test.tsx` now pins the radius alongside the height ladder, and `apps/docs/e2e/control-ladder.spec.ts` (renamed from `control-heights.spec.ts`) measures the rendered corner in a browser — a class-string assertion cannot see a mismatch that only exists between two components, which is why this one survived as long as it did.
