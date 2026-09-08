# @keystoneui/react

## 1.0.0

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

- 111102e: Upgrade `@base-ui/react` 1.4.1 → 1.7.0.

  **Public API change (minor):** `InputOTP`'s `sanitizeValue` prop is now `normalizeValue`. Base UI renamed it upstream (#4717) and `InputOTP` spreads props straight through, so a `sanitizeValue` callback will be silently ignored rather than raising an error — rename it at the call site.

  ```diff
  - <InputOTP sanitizeValue={fn} …>
  + <InputOTP normalizeValue={fn} …>
  ```

  Other notes:
  - `InputOTP` is no longer built on a preview API. Base UI un-previewed OTP Field in 1.6.0 (`OTPFieldPreview` → `OTPField`, #5029); no keystoneui API changes as a result, since the alias was internal. With Drawer un-previewed back in 1.3.0, this library now consumes zero preview APIs.
  - Across the three releases Base UI added, removed, or renamed **no** components — the exported surface is identical to 1.4.1. These were the only two breaking changes.
  - Accessibility output changed in a few places upstream, all corrections rather than regressions: the `region` role moved off `Accordion.Root` to the panel where APG prescribes it (#4961), redundant ARIA attributes were dropped from `Radio.Root` (#5213), an invalid `aria-orientation` was dropped from `ToggleGroup`'s `role="group"` (#4628), and listbox separator semantics were fixed in `Select` / `Combobox` (#5399). If you assert on any of these in tests, expect to update them.
  - Form behaviour: `CheckboxGroup` and `RadioGroup` now submit values matching native form submission (#5218, #5238), and `disabled` cascades from Root to Item in `Menu` / `Select` / `Combobox` (#5363, #5365).
  - `input-otp` was removed from the `input-otp` registry entry's dependencies — that npm package stopped being used when the component moved to Base UI, so shadcn-CLI installs were pulling an unused package and missing `@base-ui/react`.

- 2b62a48: Add `variant="floating"` to side drawers.

  `<DrawerContent variant="floating">` insets the drawer from the viewport edges, giving it a card-like floating treatment instead of edge-anchored. Default behavior unchanged.

- d9e46f6: Make `Drawer` content scrollable by default and add `DrawerBody`.
  - **Fix:** `[data-slot=drawer-inner-content]` was `overflow-hidden`, so a plain `DrawerHeader` + content + `DrawerFooter` composition silently clipped anything past the popup's `max-h-[80vh]` cap, with no scroll affordance. It is now a Y-axis scroller (`overflow-y-auto overflow-x-hidden overscroll-contain`). The X axis is pinned to `hidden` deliberately: `overflow-y: auto` alone promotes the default `overflow-x: visible` to `auto` per CSS Overflow L3, which paints a phantom gutter on macOS "Show scrollbars: Always" and makes Base UI read a bogus cross-axis scroll container, swallowing swipe-to-dismiss on diagonal touch drags. This also repairs a second defect: Base UI only recognises `overflow-y: auto | scroll` as a scroll region, so with `overflow-hidden` a downward drag on clipped content dismissed the sheet instead of scrolling it.
  - Drawers that already nest their own `overflow-y-auto` child are unaffected. That child's overflow is not `visible`, so its automatic minimum size is `0`, it shrinks to absorb the overflow, and the outer region never scrolls.
  - **New:** `DrawerBody` (`data-slot="drawer-body"`) — the scrolling middle region, making the pinned-header / scrolling-body / pinned-footer pattern a first-class API instead of a hand-rolled `<div className="overflow-y-auto px-4">`. Horizontal padding only (`px-4`), so it never doubles against `DrawerHeader` / `DrawerFooter`'s `p-4`.
  - `DrawerHeader` and `DrawerFooter` now carry `shrink-0` so they stay pinned alongside `DrawerBody`. `DrawerFooter` keeps `mt-auto` for compositions that don't use `DrawerBody`.

- 71a373e: Initial beta release of the Keystone UI component library. Includes 58 components built with Base UI, Tailwind CSS v4, and CVA.
- 21cbfbf: `InputGroup`: auto-fit `InputGroupButton` and `InputGroupInput` to the parent group's size.

  `InputGroupButton` gains a new `auto` size variant (now the default) that pairs the button to the parent `InputGroup` automatically — 32×32 inside a `default` group, 24×24 inside a `size="sm"` group, with a 4px inset all around. Icon-only buttons (only direct child is an `<svg>`) render square automatically. Buttons inside `block-start`/`block-end` toolbars fall back to a 32px height regardless of group size.

  `InputGroupInput` now reads the parent group's `size` via context and forwards it to the underlying `Input`, so a 32px `InputGroup size="sm"` no longer gets pushed open to 40px by an unsized child input. Pass `size` explicitly on `InputGroupInput` to override.

  The existing `xs` / `sm` / `icon-xs` / `icon-sm` size variants on `InputGroupButton` are unchanged and remain available as escape hatches for compact chips. Consumers who explicitly pass any of those sizes are unaffected.

  Behavior change for consumers using `<InputGroupButton>` with no `size` prop: the rendered button is now larger (32×32 in a default group instead of 24×24 from the previous `xs` default). Pin the old behavior with `size="icon-xs"` or `size="xs"` if needed.

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

- c3c0831: `Tabs`: add `morphing` prop on `TabsList` and a new `TabsTriggerLabel` sub-component for Notion-style collapsed-icon tabs.

  When `morphing` is set, inactive triggers collapse to icon-only and only the active trigger reveals its `TabsTriggerLabel`. Clicking another tab springs the new trigger open while the previously active one collapses back. The morph is driven by `motion` (`layoutId` magic-move on the pill, animated `width` on the label) so the pill and label arrive together and rapid clicks carry velocity instead of restarting. Works with both `default` and `line` variants and respects `prefers-reduced-motion`.

  ```tsx
  <Tabs defaultValue="meetings">
    <TabsList morphing shape="pill">
      <TabsTrigger value="home">
        <HomeIcon />
        <TabsTriggerLabel>Home</TabsTriggerLabel>
      </TabsTrigger>
      {/* ... */}
    </TabsList>
  </Tabs>
  ```

  Outside `morphing` mode, `TabsTriggerLabel` is a no-op wrapper, so existing tab usage is unaffected.

- 08bb340: `toast`: a bare message is now the **description**, and `title` is opt-in.

  The component has always been built on Base UI, but its API was shaped after
  Sonner: the first argument became the `title`, and `toast.promise` re-mapped
  Base UI's string shortcut from `description` back to `title`. Base UI treats
  `description` as the canonical message field — `Toast.Description` is
  documented as "the default message for the toast when no title is provided",
  and a string shortcut resolves to it. Following that makes the default toast a
  single muted line, and makes `title` mean what it looks like: an emphasized
  line above the message.

  ```tsx
  // A bare message is the description — one muted line, no <h2> rendered
  toast("Event has been created.");
  toast("Saved", { duration: 10_000 });

  // Add a title for the emphasized line above it
  toast({
    title: "Event created",
    description: "Sunday, December 3 at 9:00 AM",
    action: { label: "Undo", onClick: undo },
  });
  ```

  Both forms work on `toast.success`, `toast.error`, `toast.warning`,
  `toast.info` and `toast.loading`.

  **Breaking:** `description` moved off `ToastOptions` onto the new `ToastInput`,
  so text passed in the options position is now a type error. Migrate to the
  object form:

  ```diff
  -toast("Event has been created", { description: "Monday, January 3rd at 6:00pm" })
  +toast({
  +  title: "Event has been created",
  +  description: "Monday, January 3rd at 6:00pm",
  +})
  ```

  Single-argument calls need no change, but they now render as the muted
  description rather than an emphasized title. `ToastOptions` is still exported
  and still carries every behavior field; `ToastInput` and `ToastPromiseOptions`
  are newly exported.

  Also in this release:
  - Each `toast.promise` state accepts exactly what `toast()` accepts, so
    `duration`, `action` and `cancel` work there too, and non-string nodes
    (`loading: <Spinner />`) resolve correctly instead of producing an empty
    toast.
  - `toast.dismiss()` called without an id now closes every toast, matching Base
    UI's `close(id?)`.
  - A description-only toast is named from its description text via `aria-label`.
    Base UI names the root through the title, which such a toast doesn't render,
    leaving the `role="dialog"` without an accessible name.

- 08bb340: `Toast`: move the close button into the content row and fix the phantom height.

  The close button carried both `absolute` and `relative` in one `cn()` call.
  Those are the same tailwind-merge conflict group, so the later `relative` won
  and silently stripped `absolute top-0 right-0` — dropping the button into
  normal flow below the content, where it rendered at the bottom-left corner.
  Base UI measures the root's natural height to publish `--toast-height`, so
  that stray button was also baked into the card as ~20px of empty space beneath
  the text.

  The close button is now an inline flex child at the end of the row, always
  visible, and sized to line up with the action button. A title-only toast goes
  from 74px to 54px, and title + description from 82px to 66px.

  Alongside it:
  - Row children are vertically centred. The text block previously stretched to
    the row height (set by the close button) and left the title hanging at its
    top edge — 12px above it, 21px below.
  - The leading semantic icon is centred rather than pinned to the first line.
  - The description is `text-sm` (14px), matching every other description in the
    library; it was the lone `text-xs`.
  - Semantic types colour only their icon. The title and description stay
    neutral, so the icon carries the signal instead of the type tinting the text.
  - Dropped the `max-sm:` wrap, so the text column and the button column hold at
    every width: the message wraps short of the buttons instead of one of them
    dropping to a second row.

  Docs fix: the `toast()` reference listed `duration` as defaulting to `4000`
  (it is `5000`) and documented a `richColors` prop on `Toaster` that has never
  existed — semantic colours are always applied.

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

- e91a4da: Fix `Button` `fullWidth` prop.

  The prop was declared on `ButtonProps` and present in the CVA variant map, but was never destructured or passed to `buttonVariants(...)`. As a result `<Button fullWidth>` did not actually apply `w-full` and the boolean leaked onto the underlying DOM element, triggering React's "unknown prop" warning. Now wired through correctly — `<Button fullWidth>` produces a full-width button and no longer warns.

- 05a940f: Fix `CarouselPrevious`/`CarouselNext` sitting below the middle of the slides when `CarouselDots` or `CarouselCounter` is used.

  The arrows are absolutely positioned with `top-1/2` against the `Carousel` root, which wraps the slides _and_ anything rendered under them — so dot indicators and their margin dragged the arrows off the slide's midline. The root is now a single-column grid and the arrows take the first grid row (`CarouselContent`) as their containing block, so controls below the slides no longer shift them. The same fix straightens `CarouselNext` in vertical carousels, where it previously landed below the dots.

  `CarouselContent` must be the first child of `Carousel` for this to apply — the composition every example already uses. No public API change. If you worked around the old behavior with a manual offset such as `top-[calc(50%-1rem)]`, remove it.

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

- 0cea6cf: Publish the style and theme registry items, and fill in the npm metadata.

  `npx shadcn add https://keystoneui.io/r/default.json` and
  `https://keystoneui.io/r/themes/<name>.json` now resolve. The seven theme
  definitions in `packages/ui/registry/` were never wired into the registry
  build, so every documented theme-install URL 404'd. They are also included in
  the published tarball now (`files` gained `registry`), and `--ring` in the
  default and zinc themes was aligned to the canonical token set so installing
  the style and then re-applying the default theme no longer changes the design.

  The package also declares `repository`, `homepage`, `bugs` and
  `engines` (`node >=22`) for the first time.

- 12bde38: Fix phantom vertical scrollbar inside `SelectionBar`.

  The bar's inner container set only `overflow-x: auto`, which per CSS Overflow L3 promotes the default `overflow-y: visible` to `auto` — a hidden vertical scroll context that renders a gutter on macOS "Show scrollbars: Always". Pin the Y axis to `hidden`. No public API change.

- dc49ce8: Fix phantom vertical scrollbar inside `Table`.

  The `[data-slot=table-container]` wrapper set only `overflow-x: auto`. Per CSS Overflow L3, that promotes the default `overflow-y: visible` to `auto`, which on macOS "Show scrollbars: Always" renders a permanent vertical gutter inside every table card. Pin the Y axis to `hidden` so the implicit promotion can't recur. No public API change.

- cc75da2: `Tabs`: drop the 1px border on the active tab indicator in dark mode.

  The `default` variant's active-tab "card" was rendered with `border-input` in dark mode, producing a visible outline that didn't appear in light mode (where `shadow-sm` provides separation). The border is now removed; the dark-mode fill (`bg-input-bg`) is unchanged. The `line` variant and light mode are unaffected.

- 44b377d: `Tabs` (morphing): stabilize the pill animation in vertically-centered containers and soften the morph spring.

  When a morphing `Tabs` was rendered inside a parent that vertically centered it (e.g. `flex items-center` in a fixed-height container), Base UI's one-frame dual-mount of `TabsContent` panels — kept around so consumers can drive an exit transition — temporarily inflated the Tabs root height. That shifted the active position Framer Motion's `layoutId` FLIP captured for the pill, producing a U-shaped path on every tab change (the pill dropped toward the content area then sprang back). Hiding the leaving (`inert`) panel via a `:has()`-scoped CSS rule keeps the dual-mount frame from growing the root, eliminating the drop. Scoped to morphing tabs only — non-morphing tabs continue to use Base UI's CSS-variable indicator and are unaffected.

  Also retuned `MORPH_SPRING` to `{ duration: 0.4, bounce: 0.15 }` so the mid-morph FLIP scale spreads across more frames, making the horizontal stretch read softer.

- 7a30f90: `Toast`: fix the top edge disappearing when toasts stack.

  The root carried `bg-clip-padding`, which stops a toast's own background
  painting under its 1px border. The border tokens are semi-transparent, so the
  border then composited against whatever sat _behind_ the element rather than
  against the toast's own surface. A lone toast was fine — the backdrop was the
  page — but stacked toasts underlap each other, so the frontmost toast's top
  edge rendered against the neighbouring card and washed out, leaving a card
  that looked open at the top. The border survived only in the ~18px at each end
  that the (scaled-down) card behind didn't cover, which read as the edge being
  cropped.

  Dropping `bg-clip-padding` paints the background under the border, so all four
  edges render identically regardless of backdrop. The root also moves from
  `border-border-muted` to `border-border`, matching shadcn's Base UI toast,
  which uses neither `bg-clip-padding` nor the muted token. Measured on the
  rendered pixels, the top edge goes from 5 to 23 levels of separation against a
  card interior of 24 — the side edges measure 15, so it is no longer the weakest
  edge on the card.

- 16b0ee8: Fix `useMediaQuery` painting the wrong branch for a frame.

  The hook was `useState(false)` + `useEffect`, so it always returned `false` on the first render and corrected itself in an effect — which runs _after paint_. Anything branching on a `min-width` query therefore rendered its small-viewport layout for a frame on desktop before swapping: the `Drawer` + `Modal` responsive-dialog pattern would mount the Drawer, then replace it with the Modal.

  It is now backed by `useSyncExternalStore`, so the value is already correct on the first client render, and it is tear-free under concurrent rendering. Same signature, no API change.

  Two follow-on effects worth noting:
  - `useMediaQuery` no longer throws where `matchMedia` is absent — it returns `false` instead. The old implementation called bare `matchMedia(query)` inside its effect and crashed in environments without it.
  - Server renders still report `false`, since the true value cannot be known without a viewport. React reads `getServerSnapshot` during hydration and reconciles afterwards, so there is no hydration mismatch warning. A layout that must be correct in the first server-rendered paint still belongs in CSS.

  Adds the hook's first test file, covering first-render correctness, `change` subscription and updates, cleanup on unmount, re-subscription when the query changes, and the missing-`matchMedia` fallback.

## 1.0.0-beta.5

### Patch Changes

- 44b377d: `Tabs` (morphing): stabilize the pill animation in vertically-centered containers and soften the morph spring.

  When a morphing `Tabs` was rendered inside a parent that vertically centered it (e.g. `flex items-center` in a fixed-height container), Base UI's one-frame dual-mount of `TabsContent` panels — kept around so consumers can drive an exit transition — temporarily inflated the Tabs root height. That shifted the active position Framer Motion's `layoutId` FLIP captured for the pill, producing a U-shaped path on every tab change (the pill dropped toward the content area then sprang back). Hiding the leaving (`inert`) panel via a `:has()`-scoped CSS rule keeps the dual-mount frame from growing the root, eliminating the drop. Scoped to morphing tabs only — non-morphing tabs continue to use Base UI's CSS-variable indicator and are unaffected.

  Also retuned `MORPH_SPRING` to `{ duration: 0.4, bounce: 0.15 }` so the mid-morph FLIP scale spreads across more frames, making the horizontal stretch read softer.

## 1.0.0-beta.4

### Minor Changes

- c3c0831: `Tabs`: add `morphing` prop on `TabsList` and a new `TabsTriggerLabel` sub-component for Notion-style collapsed-icon tabs.

  When `morphing` is set, inactive triggers collapse to icon-only and only the active trigger reveals its `TabsTriggerLabel`. Clicking another tab springs the new trigger open while the previously active one collapses back. The morph is driven by `motion` (`layoutId` magic-move on the pill, animated `width` on the label) so the pill and label arrive together and rapid clicks carry velocity instead of restarting. Works with both `default` and `line` variants and respects `prefers-reduced-motion`.

  ```tsx
  <Tabs defaultValue="meetings">
    <TabsList morphing shape="pill">
      <TabsTrigger value="home">
        <HomeIcon />
        <TabsTriggerLabel>Home</TabsTriggerLabel>
      </TabsTrigger>
      {/* ... */}
    </TabsList>
  </Tabs>
  ```

  Outside `morphing` mode, `TabsTriggerLabel` is a no-op wrapper, so existing tab usage is unaffected.

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
