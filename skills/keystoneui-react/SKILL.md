---
name: keystoneui-react
description: Manages Keystone UI components and projects — adding, searching, fixing, debugging, styling, and composing UI built on Tailwind CSS v4 + Base UI. Provides project context, component docs, and usage examples. Applies when working with Keystone UI, @keystoneui/react, components.json with @keystoneui/* registries, or any project with @keystoneui/react in its dependencies. Also triggers for "keystoneui add", "find a Keystone UI example", or "switch to Keystone UI".
user-invocable: false
allowed-tools: Bash(npx -y @keystoneui/mcp@latest *), Bash(pnpm dlx @keystoneui/mcp@latest *), Bash(bunx --bun @keystoneui/mcp@latest *), Bash(npx shadcn@latest add https://keystoneui.io/r/*)
metadata:
  author: keystoneui
  version: "3.0.0"
---

# Keystone UI

A production-ready React component library built on **Tailwind CSS v4** and **Base UI** (`@base-ui/react`), with 50+ accessible components, OKLCH semantic tokens, and dark mode.

## Current Project Context

```json
!`npx -y @keystoneui/mcp@latest info --json 2>/dev/null || echo '{}'`
```

**If the block above is empty, `{}`, or absent**, this host does not run shell
injection (it is disabled for account-synced skills, by
`disableSkillShellExecution`, and everywhere outside Claude Code). Get the same
answer another way before writing imports: call the MCP tool
`get_project_context`, or run `keystoneui info`. If neither is available, ask
which install mode the project uses rather than guessing.

### Key Fields

The `project` object decides how you write code. Read it first.

- **`installMode`** — the single most important field.
  - `package` → import from subpaths: `@keystoneui/react/button`.
  - `registry` → source is vendored; import from the project's own alias:
    `@/components/ui/button` (use `aliases.ui`, never hardcode `@/`).
  - `unknown` → ask. Do not guess.
- **`aliases.ui`** — where vendored components live. Use it verbatim; a
  monorepo may use `@workspace/ui/components`.
- **`tailwindCssFile`** — the file that owns the theme tokens. **Edit that file;
  never create a new one.** Tokens in a new file do not reach the components.
- **`iconLibrary`** — `lucide` → `lucide-react`, `tabler` → `@tabler/icons-react`.
  Never assume lucide.
- **`isRSC`** — when `true`, any file using `useState`, `useEffect`, an event
  handler, or a browser API needs `"use client"` at the top. Most Keystone
  components are interactive, so in an RSC project this applies constantly.
- **`packageManager`** — use it for non-Keystone installs (`pnpm add date-fns`).

## Core Principles

1. **Imports follow `installMode`** — in `package` mode, subpaths only:
   `@keystoneui/react/button`, never the bare `@keystoneui/react` (there is no
   barrel). In `registry` mode the source is vendored, so import from
   `aliases.ui` instead. Check the context block above before writing the first
   import.
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
- **Drawer content already scrolls.** Don't hand-roll an `overflow-y-auto` div — use `DrawerBody` when `DrawerHeader`/`DrawerFooter` should stay pinned.
- **Use full Card composition.** `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`.
- **`Button` has no `isLoading` prop.** Compose with `Spinner` + `disabled`.
- **`data-slot` is stable.** Use it for consumer overrides; don't override slot values when extending.

### Data tables → [rules/data-tables.md](./rules/data-tables.md)

- **Filter triggers name their dimension.** `Status: All`, never `All Statuses` — a bare value is ambiguous beside another one. A value that names its own dimension (a date range) takes no label.
- **One representation of applied state.** Do not pair a visible control with a chip repeating it; a filter holding a value must always show its control.
- **Sorting lives in the column headers**, and `aria-sort` only on columns that actually sort.
- **The pagination footer reports the visible range**, not the page index or a selection count stated elsewhere.
- **Below `sm`, fold the toolbar into a bottom-sheet `Drawer` + `Stepper`** holding *every* filter — at that width it is the only way in.

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

## Updating vendored components

Only applies when `installMode` is `registry`. Keystone's registry is
shadcn-compatible, so the shadcn CLI's merge tooling works against it.

```bash
# 1. See every file that would change.
npx shadcn@latest add https://keystoneui.io/r/button.json --dry-run

# 2. Read the diff for each one.
npx shadcn@latest add https://keystoneui.io/r/button.json --diff button.tsx
```

Then decide per file:

- No local changes → safe to overwrite.
- Local changes → read the file, read the diff, and apply the upstream change
  by hand so the local edits survive.

**Never pass `--overwrite` without the user explicitly approving it.** Vendored
source is theirs; it is normal for it to have been edited, and `--overwrite`
discards that silently.

In `package` mode there is nothing to merge — bump `@keystoneui/react` and read
the changelog.

## Interoperating with shadcn

Keystone and shadcn can coexist, and `admin-01` deliberately ships shadcn's
sidebar because Keystone intentionally has no app shell. Two things bite:

1. **Both registries install to the same path.** `components/ui/button.tsx` is
   one file. Installing shadcn's `button` over Keystone's replaces it. Bare
   `registryDependencies` resolve to *shadcn's* registry, so a block that says
   `"button"` when it means Keystone's will quietly do this — see
   [registry.md](./registry.md).
2. **The control ladders differ.** Keystone's default control height is 40px;
   shadcn's is 36px (`new-york-v4`) and 32px in its newer presets. A shadcn
   component in a Keystone toolbar is visibly short, and nothing errors.

Full guidance, including which tokens the shadcn sidebar reads:
`https://keystoneui.io/docs/interop`.

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
| Data display | `Table` (+ `TableSortButton`, `TableEmpty`, `numeric`), `Card`, `DescriptionList`, `Avatar`, `Badge`, `Tag`, `TagGroup` |
| Table footer | `TablePagination` for rows-per-page + "page N of M" + navigation. `Pagination` is for page *links* with their own URLs — do not use it as a data-table footer. |
| Metrics / KPI | `StatValue` + `StatDelta` inside `Card` + `CardContent`. `StatDelta` takes a `direction` (`up-is-good` / `down-is-good` / `neutral`) — never colour a delta from its sign alone. Use `Card variant="outline"` for a panel row. |
| Feedback | `Toast`, `Alert`, `Progress`, `CircularProgress`, `Skeleton`, `Spinner`, `Empty` |
| Layout | `Card`, `Separator`, `Resizable`, `Accordion`, `Collapsible`, `AspectRatio`, `Carousel` |
| Bulk-action bar | `SelectionBar` |

## Block Selection

Blocks are full-page or feature-level compositions, not primitives. **If the user asks for a complete page or feature, check blocks before composing from primitives** — installing a block is faster and yields a more cohesive result.

| User asks for… | Block(s) to consider | Category |
|---|---|---|
| Sign-in form / login page | `signin-01`, `signin-02`, `signin-03`, `signin-04` | `authentication`, `login` |
| Signup / registration page | `signup-01`, `signup-02`, `signup-03`, `signup-04`, `signup-05` | `authentication`, `signup` |
| Profile dropdown / user menu | `profile-dropdown-01` | `navigation` |
| Tickets / CRM / data management table | `tickets-01` | `data` |
| Analytics dashboard / KPIs + charts | `dashboard-01` | `dashboard` |
| Admin panel / app shell with sidebar | `admin-01` | `admin` |
| Filterable data table (transactions, payments, records) | `admin-01`, `tickets-01` | `admin`, `data` |
| Betting panel / wager UI | `betting-panel-01`, `betting-panel-02`, `betting-panel-03`, `betting-panel-04` | `betting` |

Install a block: `npx shadcn@latest add https://keystoneui.io/r/<name>.json`. Or via the unified CLI: `keystoneui blocks` to list, `keystoneui blocks --category authentication` to filter, `keystoneui blocks <name>` to view source. The `--category` flag works on `list` and `search` too.

## Component List

57 components, all importable from `@keystoneui/react/{kebab-case-name}`:

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `button-group`, `calendar`, `card`, `carousel`, `checkbox`, `circular-progress`, `collapsible`, `combobox`, `command`, `copy-button`, `date-input`, `description-list`, `drawer`, `dropdown-menu`, `empty`, `field`, `form`, `input`, `input-group`, `input-otp`, `item`, `kbd`, `label`, `modal`, `native-select`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `select`, `selection-bar`, `separator`, `skeleton`, `slider`, `spinner`, `stat`, `stepper`, `switch`, `table`, `table-pagination`, `tabs`, `tag`, `tag-group`, `textarea`, `toast`, `toggle`, `toggle-group`, `tooltip`.

## Workflow

Every step below works from inside a consumer's project. Nothing here assumes
the keystone monorepo.

1. **Discover** — MCP `search_components` / `list_components`, or the CLI:
   `keystoneui search "table pagination"`, `keystoneui list --type block`.
   Filter with `--type ui|block|example` and `--category`.
2. **Find an example** — for "X with Y" patterns ("table with pagination",
   "card with image"), use `get_examples({ name: "table" })` over MCP or
   `keystoneui examples table`. Both return every demo file for that name as a
   bundle, which is where the real composition lives.
3. **Find a block** — for a whole page or feature ("sign-in page", "tickets
   table with bulk actions"), use `list_components({ type: "block" })` or
   `keystoneui blocks`. **Always try a block before composing a page from
   primitives** — see the Block Selection table above.
4. **Inspect** — `view_component({ names: [...] })` for source, and
   `keystoneui docs <name>` (or fetch
   `https://keystoneui.io/llms.mdx/docs/components/<name>`) for the prose docs
   and the API Reference table. The `/llms.mdx/...` route resolves
   `<ComponentPreview>` tags to inline TSX, so one fetch gives you docs and
   working code together. **Always read the docs before implementing a complex
   component** — props are documented there and nowhere else.
5. **Install** — `npx shadcn@latest add <url>` for vendored source, or
   `pnpm add @keystoneui/react` for the npm dependency. `get_add_command`
   builds the URLs. See [cli.md](./cli.md).
6. **Theme** — define the semantic tokens in your global CSS. See
   [customization.md](./customization.md).
7. **Review what you added** — read every file the installer wrote before
   moving on. Check for: a missing compound part (a `SelectItem` with no
   `SelectContent`), imports that do not match this project's install mode,
   icons from a library this project does not use, and any violation of the
   Critical Rules above. Fix them now, not after they compound.
8. **Verify the project** — `audit_checklist` (MCP) or `keystoneui audit` after
   a first install, to catch a missing CSS import or undefined tokens.

## Sources of Truth

Reach for these in order. The first two need no network beyond the registry;
the third is the fallback when a tool is unavailable.

- **MCP tools** — `view_component` (source), `get_examples` (real usage),
  `get_theme_info` (tokens), `audit_checklist` (project wiring).
- **The `keystoneui` CLI** — the same surface as verbs, for shells and non-MCP
  hosts. See [cli.md](./cli.md).
- **Fetched docs** — when neither is available:
  - `https://keystoneui.io/llms.mdx/docs/components/<name>` — per-component MDX
    with previews resolved to inline `tsx`.
  - `https://keystoneui.io/llms.mdx/docs/blocks/<name>` — same for blocks.
  - `https://keystoneui.io/llms-components.txt` — every component in one document.
  - `https://keystoneui.io/AGENTS.md` — condensed project guidance.

Component props live in the `## API Reference` table of each component's docs
page. They are not in the registry JSON, so `view_component` alone will not
give them to you — read the docs when you need a prop's type or default.

## Detailed References

- [mcp.md](./mcp.md) — MCP setup, the 8 tools, and recommended workflow
- [cli.md](./cli.md) — `npx shadcn@latest add`, npm package install, bundled scripts, direct MDX URLs
- [customization.md](./customization.md) — CSS setup, light/dark tokens, color naming, radius scale, motion/layering, adding new tokens
- [registry.md](./registry.md) — authoring registry items: the explicit `target` rule, style vs theme, block categories, cross-registry dependencies
- [rules/styling.md](./rules/styling.md) — semantic colors, layout, hover gating, focus, transitions, z-scale
- [rules/forms.md](./rules/forms.md) — `Form`, `FieldGroup`, `Field`, `InputGroup`, `ToggleGroup`, `FieldSet`, validation
- [rules/composition.md](./rules/composition.md) — `render`, compound parts, group items, Modal title, Card composition, `data-slot`
- [rules/data-tables.md](./rules/data-tables.md) — filter toolbars, applied state, sorting, pagination footer, mobile fold
- [rules/icons.md](./rules/icons.md) — lucide-react, no sizing classes, pass as components
- [rules/base-vs-radix.md](./rules/base-vs-radix.md) — `render` vs `asChild`, attribute semantics, animation attributes
