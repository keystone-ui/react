---
name: keystoneui-react
description: "Keystone UI React component library (Tailwind CSS v4 + Base UI). Use when working with Keystone UI components, installing Keystone UI, customizing themes, or accessing component documentation. Keywords: Keystone UI, keystoneui, @keystoneui/react, Base UI, Tailwind v4."
user-invocable: true
metadata:
  author: keystoneui
  version: "2.0.0"
---

# Keystone UI

A production-ready React component library built on **Tailwind CSS v4** and **Base UI** (`@base-ui/react`), with 50+ accessible components, OKLCH semantic tokens, and dark mode.

## Core Principles

1. **Subpath imports only** — `@keystoneui/react/button`, never `@keystoneui/react`. There is no barrel.
2. **Base UI, not Radix** — primitives come from `@base-ui/react`. The slot pattern is `render`, not `asChild`. → [rules/base-vs-radix.md](./rules/base-vs-radix.md)
3. **Semantic tokens** — `bg-primary`, `text-muted-foreground`, never raw colors.
4. **Compose, don't reinvent** — use existing components and their compound parts before writing custom markup.
5. **`data-slot` is the public API** — every part has a stable `data-slot` for styling targets.

## Installation

Two paths reach the same library — pick one. See [cli.md](./cli.md) for both.

```bash
# As an npm dependency
pnpm add @keystoneui/react

# Or vendor source via shadcn-compatible registry
npx shadcn@latest add https://keystoneui.io/r/button.json
```

CSS setup (order matters):

```css
@import "tailwindcss";
@import "@keystoneui/react/base.css";
```

Then define theme tokens — see [customization.md](./customization.md).

## Critical Rules

These are always enforced. Each links to a file with code pairs.

### Styling → [rules/styling.md](./rules/styling.md)

- **Semantic colors only.** `bg-primary`, `text-muted-foreground` — never raw Tailwind colors.
- **Built-in variants before custom styles.** `<Button variant="outline">`, not `className="border ..."`.
- **`className` for layout, not styling.** Don't override component colors or typography.
- **No `space-x-*` / `space-y-*`.** Use `flex` + `gap-*`.
- **Use `size-*` when width and height are equal.** `size-10`, not `w-10 h-10`.
- **Two focus patterns — never mix.** Outline-based (buttons, checkboxes) or ring-based (inputs, selects).
- **No `transition-all`.** Specify exact properties. (Button is the documented exception.)
- **Hover gating.** `[&>a]:hover:bg-muted`, not `[&>a:hover]:bg-muted` — the second form bypasses `@media (hover: hover)`.
- **No manual `z-index` on overlay components.** Use the `--z-*` scale; library components manage stacking.
- **Both `disabled:` and `data-disabled:`.** Always include `cursor-not-allowed` and `opacity-50`.

### Forms → [rules/forms.md](./rules/forms.md)

- **Two patterns ship.** Lightweight: `Form`/`Label`/`Description`/`ErrorMessage` from `/form`. Rich: `Field`/`FieldLabel`/`FieldDescription`/`FieldError` from `/field`. Pick one per form.
- **`<Form>` renders a `<form>` element.** Use `onSubmit` directly.
- **`InputGroup` requires `InputGroupInput`/`InputGroupTextarea`.** Never raw `Input` inside `InputGroup`.
- **Buttons inside inputs use `InputGroupAddon`** (and optionally `InputGroupButton`).
- **Option sets (2–7 choices) use `ToggleGroup`.** Don't loop `Button` with manual active state.
- **`FieldSet` + `FieldLegend` for grouped checkboxes/radios.** `FieldLegend` accepts `variant="label"` for inline forms.
- **Validation: `aria-invalid` on the control + `FieldError` (or `ErrorMessage`).** Don't use `data-invalid` on `Field` — it doesn't style anything in Keystone UI.
- **Disabled: `disabled` on the control; optionally `data-disabled` on `Field`** to dim the `FieldLabel` via the `group/field` selector.

### Composition → [rules/composition.md](./rules/composition.md)

- **Use `render`, not `asChild`.** Base UI's slot pattern.
- **Items always inside their group.** `SelectItem` → `SelectContent`, `TabsTrigger` → `TabsList`, `DropdownMenuItem` → `DropdownMenuContent`.
- **`Modal`, `Drawer`, `AlertDialog` need a title.** Use `className="sr-only"` to hide it visually.
- **Use full Card composition.** `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`.
- **`Button` has no `isLoading` prop.** Compose with `Spinner` + `disabled`.
- **`data-slot` is stable.** Use it for consumer overrides; don't override slot values when extending.

### Icons → [rules/icons.md](./rules/icons.md)

- **`lucide-react` for all icons.** No `@iconify/react`, `@remixicon/react` (in app code), or other libraries.
- **No sizing classes on icons inside components.** Components handle icon sizing via SVG boilerplate.
- **Pass icons as components, not string keys.** `icon={Check}`, not `icon="check"`.

### Base UI vs Radix → [rules/base-vs-radix.md](./rules/base-vs-radix.md)

- **Never import `@radix-ui/*`.** Use Keystone UI's wrappers, which use `@base-ui/react`.
- **`render` instead of `asChild`.** `<ModalTrigger render={<Button />}>Open</ModalTrigger>`.
- **`data-open` / `data-closed` / `data-checked`** instead of Radix-style `data-state="open"`.

## Key Patterns

```tsx
// Subpath import — every part comes from the same path
import { Modal, ModalTrigger, ModalContent, ModalTitle } from "@keystoneui/react/modal";

// Form: Form (real <form>) + FieldGroup + Field, controls inside Field
// Form from "/form"; Field & friends from "/field"
<Form onSubmit={handleSubmit}>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" name="email" type="email" />
    </Field>
  </FieldGroup>
  <Button type="submit">Sign in</Button>
</Form>

// Validation: aria-invalid on the control + FieldError for the message
<Field>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldError>Invalid email.</FieldError>
</Field>

// Custom trigger: render prop, not asChild
<ModalTrigger render={<Button variant="secondary" />}>Open</ModalTrigger>

// Spacing: gap, not space-y
<div className="flex flex-col gap-4">...</div>

// Status: Badge or semantic tokens, not raw colors
<Badge variant="secondary">+20.1%</Badge>

// Loading: compose, no isLoading prop
<Button disabled={isPending}>
  {isPending && <Spinner />}
  {isPending ? "Saving..." : "Save"}
</Button>
```

## Component Selection

| Need | Use |
|---|---|
| Action / button | `Button` (variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`) |
| Form layout | `Form` + `FieldGroup` + `Field` |
| Text input | `Input`, `Textarea`, `InputGroup` (with addons), `InputOTP` |
| Choice (one of many) | `Select`, `Combobox` (searchable), `RadioGroup`, `NativeSelect` |
| Choice (toggle) | `ToggleGroup` (2–5 options), `Switch` (boolean), `Checkbox` |
| Date / time | `DateInput`, `Calendar` |
| Overlays | `Modal`, `Drawer`, `AlertDialog`, `Popover`, `Tooltip` |
| Menus | `DropdownMenu`, `Command` (palette) |
| Navigation | `Tabs`, `Breadcrumb`, `Pagination`, `Stepper` |
| Data display | `Table`, `Card`, `DescriptionList`, `Avatar`, `Badge`, `Tag`, `TagGroup` |
| Feedback | `Toast`, `Alert`, `Progress`, `CircularProgress`, `Skeleton`, `Spinner`, `Empty` |
| Layout | `Card`, `Separator`, `Resizable`, `Accordion`, `Collapsible`, `AspectRatio`, `Carousel` |
| Bulk-action bar | `SelectionBar` |

## Component List

54 components, all importable from `@keystoneui/react/{kebab-case-name}`:

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `button-group`, `calendar`, `card`, `carousel`, `checkbox`, `circular-progress`, `collapsible`, `combobox`, `command`, `date-input`, `description-list`, `drawer`, `dropdown-menu`, `empty`, `field`, `form`, `input`, `input-group`, `input-otp`, `item`, `kbd`, `label`, `modal`, `native-select`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `select`, `selection-bar`, `separator`, `skeleton`, `slider`, `spinner`, `stepper`, `switch`, `table`, `tabs`, `tag`, `tag-group`, `textarea`, `toast`, `toggle`, `toggle-group`, `tooltip`.

## Workflow

1. **Discover** — use MCP `search_components` / `list_components`, or `node scripts/list_components.mjs`.
2. **Inspect** — `view_component` (MCP), `node scripts/get_component_docs.mjs <name>`, or fetch `https://keystoneui.io/docs/components/<name>.mdx` directly. **Always read the docs before implementing complex components.**
3. **Install** — `npx shadcn@latest add <url>` (vendored source) or `pnpm add @keystoneui/react` (npm dependency). See [cli.md](./cli.md).
4. **Theme** — define semantic tokens in your CSS. See [customization.md](./customization.md).
5. **Verify** — run MCP `audit_checklist` after first install to catch missing CSS imports or tokens.

## Detailed References

- [mcp.md](./mcp.md) — MCP setup, the 6 tools, and recommended workflow
- [cli.md](./cli.md) — `npx shadcn@latest add`, npm package install, bundled scripts, direct MDX URLs
- [customization.md](./customization.md) — CSS setup, light/dark tokens, color naming, radius scale, motion/layering, adding new tokens
- [rules/styling.md](./rules/styling.md) — semantic colors, layout, hover gating, focus, transitions, z-scale
- [rules/forms.md](./rules/forms.md) — `Form`, `FieldGroup`, `Field`, `InputGroup`, `ToggleGroup`, `FieldSet`, validation
- [rules/composition.md](./rules/composition.md) — `render`, compound parts, group items, Modal title, Card composition, `data-slot`
- [rules/icons.md](./rules/icons.md) — lucide-react, no sizing classes, pass as components
- [rules/base-vs-radix.md](./rules/base-vs-radix.md) — `render` vs `asChild`, attribute semantics, animation attributes
