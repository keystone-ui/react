# @keystoneui/react

## 1.0.0-beta.3

### Minor Changes

- 21cbfbf: `InputGroup`: auto-fit `InputGroupButton` and `InputGroupInput` to the parent group's size.

  `InputGroupButton` gains a new `auto` size variant (now the default) that pairs the button to the parent `InputGroup` automatically — 32×32 inside a `default` group, 24×24 inside a `size="sm"` group, with a 4px inset all around. Icon-only buttons (only direct child is an `<svg>`) render square automatically. Buttons inside `block-start`/`block-end` toolbars fall back to a 32px height regardless of group size.

  `InputGroupInput` now reads the parent group's `size` via context and forwards it to the underlying `Input`, so a 32px `InputGroup size="sm"` no longer gets pushed open to 40px by an unsized child input. Pass `size` explicitly on `InputGroupInput` to override.

  The existing `xs` / `sm` / `icon-xs` / `icon-sm` size variants on `InputGroupButton` are unchanged and remain available as escape hatches for compact chips. Consumers who explicitly pass any of those sizes are unaffected.

  Behavior change for consumers using `<InputGroupButton>` with no `size` prop: the rendered button is now larger (32×32 in a default group instead of 24×24 from the previous `xs` default). Pin the old behavior with `size="icon-xs"` or `size="xs"` if needed.

### Patch Changes

- `Tabs`: drop the 1px border on the active tab indicator in dark mode.

  The `default` variant's active-tab "card" was rendered with `border-input` in dark mode, producing a visible outline that didn't appear in light mode (where `shadow-sm` provides separation). The border is now removed; the dark-mode fill (`bg-input-bg`) is unchanged. The `line` variant and light mode are unaffected.

## 1.0.0-beta.2

### Minor Changes

- e91a4da: Add `secondary` variant to `Toggle` and `ToggleGroup`.

  Filled `bg-secondary` background when unpressed, inverts to `bg-foreground` / `text-background` when pressed. Useful for segmented-control patterns where unpressed items should still read as part of a control rather than empty space — without depending on consumer overrides for selection contrast. Existing `default` and `outline` variants are unchanged.

  ```tsx
  <ToggleGroup variant="secondary" defaultValue={["medium"]}>
    <ToggleGroupItem value="low">Low</ToggleGroupItem>
    <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
    <ToggleGroupItem value="high">High</ToggleGroupItem>
  </ToggleGroup>
  ```

  Works in both joined (`spacing=0`, default) and spaced (`spacing>0`) modes. Consumer `aria-pressed:bg-*` overrides on individual items still win via tailwind-merge — useful for semantic colouring (status, risk).

### Patch Changes

- e91a4da: Fix `Button` `fullWidth` prop.

  The prop was declared on `ButtonProps` and present in the CVA variant map, but was never destructured or passed to `buttonVariants(...)`. As a result `<Button fullWidth>` did not actually apply `w-full` and the boolean leaked onto the underlying DOM element, triggering React's "unknown prop" warning. Now wired through correctly — `<Button fullWidth>` produces a full-width button and no longer warns.

## 1.0.0-beta.1

### Major Changes

- 2b62a48: **Breaking: `<Form>` now renders a real `<form>` element.**

  Previously `<Form>` rendered a `<div>` and required a separate `<form>` wrapper for submission. It now is the form: accepts `onSubmit` and any `FormHTMLAttributes<HTMLFormElement>`, and Enter-to-submit works without extra wiring.

  To restore the old layout-only behavior (a `<div>` with the same vertical spacing), use the new `<FieldGroup>` export from `@keystoneui/react/form`:

  ```tsx
  // Before
  <Form>
    <Label>...</Label>
    <Input />
  </Form>

  // After (real form)
  <Form onSubmit={handleSubmit}>
    <Label>...</Label>
    <Input name="email" />
  </Form>

  // After (layout-only div, equivalent to the old <Form>)
  <FieldGroup>
    <Label>...</Label>
    <Input />
  </FieldGroup>
  ```

  Also: RadioGroupItem indicator now scales from 0.5 (was 0) for a smoother checked-state animation.

  Migration: any consumer wrapping `<Form>` in their own `<form>` should remove the wrapper or switch to `<FieldGroup>`.

### Minor Changes

- 2b62a48: Add `variant="floating"` to side drawers.

  `<DrawerContent variant="floating">` insets the drawer from the viewport edges, giving it a card-like floating treatment instead of edge-anchored. Default behavior unchanged.

- 2b62a48: Add `SelectionBar` primitive and a global thin scrollbar.
  - New `SelectionBar` component — bulk-action bar that surfaces when one or more items are selected (e.g. tickets, rows, list items). Imported via `@keystoneui/react/selection-bar`.
  - `base.css` now ships a global `scrollbar-width: thin` style so app-level scrollable surfaces match the popup look without per-component overrides.

- 2b62a48: Surface popup animations + new motion and layering tokens.
  - Surface popups (DropdownMenu, Select, Combobox, Popover) now animate via `data-starting-style` / `data-ending-style` for tighter Base UI alignment.
  - New CSS tokens in `base.css`:
    - **Duration:** `--duration-fast`, `--duration-base`, `--duration-slow`, `--duration-drawer`
    - **Easing:** `--ease-out`, `--ease-in-out`, `--ease-drawer`
    - **Z-index:** `--z-sticky`, `--z-drawer` (40), `--z-modal` (50), `--z-dropdown`, `--z-popover` (60), `--z-tooltip` (70), `--z-toast` (80)
  - Use these tokens in app code instead of hard-coded durations or z-index values. Library overlay components manage their own stacking.

- 11dc9b5: Upgrade dependencies to latest stable + modernize React 19 patterns.

  **Public API change (minor):** primitives no longer use `React.forwardRef` —
  `ref` is now a regular prop in keeping with React 19. Consumers that read
  the component prop type via `React.ComponentProps<typeof Foo>` will see
  `ref` as a regular prop (typed as `React.RefAttributes<T>`). Most callers
  need no change.

  **Headline upstream bumps:**
  - `@base-ui/react` 1.2 → 1.4 (Drawer is stable; new optional Label/InputGroup
    parts on Combobox/Select/Slider/Autocomplete; many bug fixes)
  - `lucide-react` 0.575 → 1.11 (`*Icon` suffix dropped from default exports;
    imports rewritten as aliases throughout the codebase; brand icons removed,
    `Github` replaced with `Code` in the docs home)
  - `shadcn` CLI 3 → 4, `vite` 7 → 8, `typescript` 5.9 → 6, `next` 16.1 → 16.2,
    `motion` 12.34 → 12.38, `react-day-picker` 9.13 → 9.14,
    `react-resizable-panels` 4.6 → 4.10, `react-aria-components` 1.15 → 1.17,
    `chromatic` 15 → 16, `vitest` 4.0 → 4.1, `storybook` 10.2 → 10.3,
    `jsdom` 28 → 29, `zod` 3 → 4 (mcp), Tailwind 4.2.0 → 4.2.4, biome 2.4.4 →
    2.4.13, ultracite 7.2 → 7.6.

  **Tooling note:** TS 6 deprecates `baseUrl`. The shared `typescript-config`
  sets `ignoreDeprecations: "6.0"` to silence the warning while keeping
  `apps/docs`'s path-alias setup working. Revisit when TS 7 lands.

### Patch Changes

- 2b62a48: Touch-target and a11y polish across primitives.
  - `Button` now has an explicit transition list (`transform`, `background-color`, `color`, `border-color`, `box-shadow`, `outline-color`) instead of `transition-all`, and defaults to `type="button"` to prevent accidental form submission inside `<form>`.
  - AAA-leaning touch-target extension on Toast, Drawer dismiss, InputOTP slot, and other primitives — visual unchanged, hit area larger.
  - Safe-area-inset polish for Toast and Drawer on mobile.

- 2b62a48: Drop redundant `motion-reduce:` utilities from per-component class lists. `prefers-reduced-motion` is now handled centrally in `base.css`, so primitives no longer need to opt-in individually. Behavior unchanged for end users.
- 23a3421: Motion and touch polish across primitives:
  - Modal/AlertDialog/Popover/Dropdown/Select/Combobox/Tooltip now scale from 0.95 (was 0.96), exact match to Emil's "scale-from-0" principle.
  - Modal and AlertDialog overlays now exit at 100ms (was 125ms) so the backdrop doesn't linger past content.
  - Accordion chevron picks up an explicit `duration-200 ease-out` to match its sibling panel.
  - Switch root + thumb get explicit `duration-150` (was inheriting Tailwind defaults).
  - Input gets explicit `duration-150` and `aria-invalid:transition-none` so validation flips don't crossfade through the focus transition.
  - Badge's `<a>` link variants now crossfade their hover via `[a]:transition-colors` instead of snapping.
  - Checkbox / Switch / RadioGroupItem hit-area extension bumped from `-inset-x-3 -inset-y-2` to `-inset-x-4 -inset-y-3` for AAA-leaning touch targets without changing the visual.

- 2b62a48: Remove `max-height` constraint from `PopoverContent`. Popovers can now hold arbitrarily long content — consumers control sizing explicitly via `className` if they need it. Aligns with the existing `overflow-auto` on `PopoverContent`.
- 2b62a48: Fix portaled popups (DropdownMenu, Select, Combobox, Popover) so they sit above modals and drawers.

  Previously a Select inside a Modal could be visually trapped under the modal overlay. Popups now sit at `z=60`, above modal (`50`) and drawer (`40`), below tooltip (`70`) and toast (`80`).

## 0.1.0-beta.0

### Minor Changes

- Initial beta release of the Keystone UI component library. Includes 58 components built with Base UI, Tailwind CSS v4, and CVA.
