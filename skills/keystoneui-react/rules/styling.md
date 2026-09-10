# Styling

These are the always-enforced styling rules for `@keystoneui/react`. See [../customization.md](../customization.md) for theming and CSS variables.

## Contents

- Semantic colors only — never raw Tailwind colors
- Built-in variants before custom styles
- `className` for layout, not styling
- No `space-x-*` / `space-y-*` — use `gap-*`
- `size-*` when width and height are equal
- No manual `dark:` color overrides
- Use `cn()` for conditional classes
- Hover gating — never embed `:hover` in arbitrary selectors
- Two focus patterns — outline vs ring, never mix
- Transitions — never `transition-all`
- Motion and layering tokens — `--duration-*`, `--ease-*`, `--z-*`
- Disabled states — both `disabled:` and `data-disabled:`
- Cursor — explicit `cursor-pointer` / `cursor-not-allowed`

---

## Semantic colors only

Use semantic tokens. Never raw Tailwind colors in component or app code.

**Incorrect:**

```tsx
<div className="bg-blue-500 text-white">
  <p className="text-gray-600">Secondary text</p>
</div>
```

**Correct:**

```tsx
<div className="bg-primary text-primary-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

For status indicators, prefer `Badge` variants or semantic tokens. All four status tones are tokenized: `text-success` / `bg-success`, `text-warning` / `bg-warning`, `text-destructive`, and `text-muted-foreground` for neutral. Never reach for `text-emerald-600` or `text-amber-500` — and never pair a status token with a `dark:` override, since the tokens already re-step for a dark surface.

Note `--success-foreground` and `--warning-foreground` are deliberately **dark** rather than near-white: near-white measures 3.10:1 on the success green and 1.97:1 on the warning amber, both WCAG failures. Use `text-success-foreground` / `text-warning-foreground` on a filled chip, never `text-white`.

For charts, use `--chart-1` … `--chart-5` (`bg-chart-1`, `fill-chart-3`). Five slots is a decision, not a starting point — the ramp separates by lightness so it survives colour blindness, and adding hues erodes that. Resolve a series' colour through one shared helper so the legend swatch and the mark cannot disagree.

For a data table: `TableHead sortDirection` sets `aria-sort` (omit it for a non-sortable column — `null` means sortable but inactive), `TableSortButton` is the affordance and is polymorphic via `render` for URL-driven sorting, `numeric` right-aligns with `text-end tabular-nums`, and `TableEmpty` provides the spanning "no rows" row. A sticky header needs `containerClassName="max-h-96 overflow-y-auto"` plus `sticky top-0 z-[var(--z-sticky)] bg-background` on `TableHeader`; it cannot stick to the page scroll, only within a bounded container.

There are no layout primitives (no `Grid`/`Stack`/`Flex`/`Container`) and there should not be — layout goes in `className`. Two utilities are load-bearing rather than cosmetic, though: `min-w-0 flex-1` on the text column of a header row (a flex item will not shrink below its content's intrinsic width, so a long title pushes the actions off-screen), and `[&>*]:min-w-0` on any grid holding a table or a wide value (grid children resolve to `min-content`, so one long value pushes its track open and gives the document a horizontal scrollbar). `items-end` rather than `items-center` on such a header row, too, so the actions align to the bottom of the text block when a description is present.

Pair every `sticky` with `print:static`. A sticky element resolves against a scrollport that does not exist on paper, so it lands over the content it was pinned above. Keystone's sticky affordances are opt-in through `className`, so there is no library class to bake this into. The `dark` variant is scoped to `@media screen` so paper always gets the light tokens; no print rules ship in `base.css`, since hiding chrome is consumer policy and `!important` in library CSS cannot be undone by a consumer's class.

`Toggle`/`ToggleGroup` and `Button` use different size scales and do not match at their defaults — Button default is 40px, Toggle default is 36px (it matches the popup item height). In a toolbar, pair `ToggleGroup size="lg"` with a default `Button` (both 40px), or `size="sm"` on both (both 32px). Mixing the defaults gives a 4px mismatch.

Prefer logical properties for anything new: `text-end` over `text-right`, `start-0` over `left-0`, `ms-*`/`me-*` over `ml-*`/`mr-*`. Most of the library still uses physical utilities, so this is a beachhead rather than a settled convention — but do not add to the pile.

`Card` has two surface tiers: `filled` (default, paints `bg-card`) and `outline` (no fill, for chart and table panels). A table goes in `CardContent`, which shares the card's horizontal padding with the title so the heading, the row separators and the cell text line up. All spacing resolves from `--card-spacing`, and `<Card className="[--card-spacing:0px]">` is for the narrower case of a card that is *only* a table — never under a padded `CardHeader`, which leaves the heading indented three times further than the columns.

**Exception:** Badge color variants (`bg-red-500/15`, `text-red-700`) intentionally use raw Tailwind colors because each variant maps to a distinct hue.

---

## Built-in variants before custom styles

**Incorrect:**

```tsx
<Button className="border border-input bg-transparent hover:bg-accent">
  Click me
</Button>
```

**Correct:**

```tsx
<Button variant="outline">Click me</Button>
```

---

## `className` for layout, not styling

Use `className` for `max-w-md`, `mx-auto`, `mt-4`. Do not override component colors or typography. To customize appearance, in order of preference: built-in variants → semantic tokens → CSS variables in your global stylesheet.

---

## No `space-x-*` / `space-y-*`

Use `gap-*` with flex/grid. `space-y-4` → `flex flex-col gap-4`.

```tsx
<div className="flex flex-col gap-4">
  <Input />
  <Button>Submit</Button>
</div>
```

---

## `size-*` when width and height are equal

`size-10` not `w-10 h-10`. Applies to icons, avatars, skeletons, square buttons.

---

## No manual `dark:` color overrides

Semantic tokens already adapt. Use `bg-background text-foreground`, not `bg-white dark:bg-gray-950`.

---

## Use `cn()` for conditional classes

```tsx
import { cn } from "@/lib/utils";

<div className={cn("flex items-center", isActive && "bg-primary text-primary-foreground")}>
```

Don't write template-literal ternaries inside `className`.

---

## Hover gating — never embed `:hover` in arbitrary selectors

Keystone UI's `base.css` overrides Tailwind's `hover` variant with `@media (hover: hover)` so hover styles only fire on devices that support hover. Touch taps don't trigger sticky `:hover` state.

This works automatically for `hover:bg-primary/90`, `[a]:hover:bg-muted`, `[&>div]:hover:bg-accent`. It does **not** work if you bake `:hover` into the arbitrary selector.

**Incorrect — bypasses gating:**

```tsx
"[&>a:hover]:text-primary"
"[&>div:hover]:bg-muted"
```

**Correct — composes hover variant:**

```tsx
"[&>a]:hover:text-primary"
"[&>div]:hover:bg-muted"
```

---

## Two focus patterns — never mix

Pick the one that matches the control type and never combine them.

**Outline-based** — buttons, checkboxes, radios, switches, accordion triggers, tab triggers:

```
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50
```

**Ring-based** — text inputs, textareas, selects, native selects (inset ring inside a bordered control):

```
focus:ring-1 focus:ring-inset focus:ring-ring focus:border-ring
```

`aria-invalid` mirrors the chosen pattern: ring-based controls get `aria-invalid:ring-destructive`; outline-based controls get `aria-invalid:border-destructive` + `aria-invalid:focus-visible:outline-destructive/50`.

---

## Transitions — never `transition-all`

Always specify the exact properties. `transition-all` causes unrelated transitions (e.g. shadows fading on hover when only color should).

```
transition-[color,box-shadow]                          /* form controls */
transition-[color,background-color,border-color,box-shadow]  /* TabsTrigger */
transition-[background-color,border-color]             /* Switch */
transition-transform duration-150 ease-out             /* icon rotations */
transition-colors                                      /* ComboboxChips */
```

**Exception:** `Button` uses `transition-all` because it combines color, background, border, and `active:scale-[0.98]` press feedback.

`aria-invalid` validation states use `transition-none` on Checkbox / Radio / Switch to prevent flash on error.

---

## Motion and layering tokens

Defined in `packages/ui/src/base.css`. Use these instead of hard-coded durations or z-index.

**Duration tokens** — `--duration-fast` (≈100ms), `--duration-base` (≈160ms), `--duration-slow` (≈220ms), `--duration-drawer`.

**Easing tokens** — `--ease-out`, `--ease-in-out`, `--ease-drawer`.

**Z-index scale** — `--z-sticky`, `--z-drawer` (40), `--z-modal` (50), `--z-dropdown`, `--z-popover` (60), `--z-tooltip` (70), `--z-toast` (80).

**Layering rule:** popups (Dropdown, Select, Combobox, Popover) sit at `z=60` — above modal (`50`) and drawer (`40`), below tooltip (`70`) and toast (`80`). Don't add `z-50` or `z-[999]` manually to overlay components — they already manage their own stacking.

---

## Disabled states — both `disabled:` and `data-disabled:`

- `disabled:` — native HTML disabled (Input, Textarea, Button, Checkbox, Radio, Select, NativeSelect, Tabs)
- `data-disabled:` — Base UI data attribute (DropdownMenuItem, ComboboxItem, SelectItem)

Both must include `cursor-not-allowed` and `opacity-50`.

```
disabled:cursor-not-allowed disabled:opacity-50
data-disabled:cursor-not-allowed data-disabled:opacity-50
```

For `Field` validation/disabled states, see [forms.md](./forms.md).

---

## Cursor — explicit `cursor-pointer` / `cursor-not-allowed`

Tailwind v4 changed the default cursor. Always set it explicitly on interactive elements (`Button`, `TabsTrigger`, popup items). Library components handle this internally; only relevant when you build custom interactive markup.

---

## Quick reference

```tsx
// Layout: gap, not space-y
<div className="flex flex-col gap-4">...</div>

// Square: size-, not w-/h-
<Avatar className="size-10" />

// Status: Badge or semantic tokens, not raw colors
<Badge variant="secondary">+20.1%</Badge>
<span className="text-success">+20.1%</span>
<span className="text-destructive">-3.2%</span>

// Conditional: cn(), not template literal
<div className={cn("flex", isActive && "bg-primary")} />

// Overlay z-index: never manual
<DropdownMenuContent>...</DropdownMenuContent>  // handles its own stacking
```
