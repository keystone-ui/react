# Base UI vs Radix

The single biggest mental-model rule for anyone migrating from shadcn or Radix-based libraries.

## Keystone UI uses Base UI, not Radix

All primitives come from `@base-ui/react`. **Never** import from `@radix-ui/*`. They are different libraries with different APIs.

**Incorrect:**

```tsx
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
```

**Correct:** consume Keystone UI's wrapped components, which use Base UI internally.

```tsx
import { Modal, ModalTrigger, ModalContent } from "@keystoneui/react/modal";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@keystoneui/react/select";
```

If you need a Base UI primitive directly (rare), import from `@base-ui/react/<primitive>`.

---

## Slot pattern: `render` (Base) vs `asChild` (Radix)

This is the most common point of confusion. Base UI uses a `render` prop. Radix uses `asChild`. They serve the same purpose — let you provide a custom element as the trigger / item / content — but the API is different.

**Incorrect (Radix pattern, will not work):**

```tsx
<ModalTrigger asChild>
  <Button>Open</Button>
</ModalTrigger>
```

**Correct (Base pattern):**

```tsx
<ModalTrigger render={<Button />}>Open</ModalTrigger>
```

`render` accepts:

- A JSX element — its props get merged with the trigger's props.
- A render function — `(props) => <Button {...props} />` for full control.

Same pattern across `DropdownMenuTrigger`, `PopoverTrigger`, `TooltipTrigger`, `DrawerTrigger`, `AlertDialogTrigger`, `ModalClose`, `AlertDialogClose`, etc.

```tsx
<DropdownMenuTrigger render={<Button variant="secondary" />}>
  Options
</DropdownMenuTrigger>

<TooltipTrigger render={<Button size="icon" />}>
  <Search />
</TooltipTrigger>

<ModalClose render={<Button variant="secondary" />}>Cancel</ModalClose>
```

---

## State props differ from Radix

Several Base UI primitives use different prop names than Radix.

| Concept | Radix | Base UI / Keystone UI |
|---|---|---|
| Controlled open state | `open` / `onOpenChange` | `open` / `onOpenChange` (matches) |
| Default open | `defaultOpen` | `defaultOpen` (matches) |
| Modal/Dialog content | `Dialog.Content` | `ModalContent` |
| Item value (Select) | `value` | `value` (matches) |
| Slot pattern | `asChild` | `render` |
| Disabled item state | `disabled` | `disabled` |
| Item visibility / state | `data-state="open|closed|active|inactive"` | `data-open` / `data-closed` / `data-checked` / `data-unchecked` (independent attributes) |

When writing CSS selectors against Keystone UI components, target the Base-style attributes:

```css
[data-slot="dropdown-menu-item"][data-checked] { ... }
[data-slot="modal-content"][data-open] { ... }
```

Not `[data-state="checked"]` or `[data-state="open"]`.

---

## Animation attributes

Base UI exposes `data-open` / `data-closed` for enter/exit animations. Use Tailwind's `data-open:` / `data-closed:` variants:

```
data-open:animate-in data-closed:animate-out
data-closed:fade-out-0 data-open:fade-in-0
data-closed:zoom-out-95 data-open:zoom-in-95
data-[side=bottom]:slide-in-from-top-2
```

Not Radix-style `data-state="open"` / `data-state="closed"`.

---

## ToggleGroup / Tabs / RadioGroup `value` semantics

Base UI's group primitives expose `value` (single selection) or `value` as an array (multi-selection on `ToggleGroup` with `type="multiple"`-like behavior). The exact API may differ from Radix; always check the component's documentation via `node scripts/get_component_docs.mjs <component>` before assuming.

---

## When in doubt, check the source

If you're unsure whether a prop / pattern works on a Keystone UI component, fetch the source:

```bash
node scripts/get_source.mjs select
node scripts/get_component_docs.mjs select
```

Or via MCP: `view_component({ names: ["select"] })`. Don't guess based on Radix knowledge — the wrappers thin out Base UI but don't reshape it into Radix's API.
