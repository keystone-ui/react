# Composition

How Keystone UI components are composed and how to extend them.

## Contents

- Subpath imports — never barrel imports
- Compound parts and named exports
- The `render` prop for custom triggers
- Items always inside their group
- Modal, Drawer, AlertDialog need a title
- Use full Card composition
- `Button` has no loading prop — compose with `Spinner`
- `data-slot` for stable styling targets

---

## Subpath imports — never barrel imports

Always import from the per-component subpath. There is no barrel file.

**Incorrect:**

```tsx
import { Button, Input } from "@keystoneui/react";
```

**Correct:**

```tsx
import { Button } from "@keystoneui/react/button";
import { Input } from "@keystoneui/react/input";
import { Modal, ModalTrigger, ModalContent } from "@keystoneui/react/modal";
```

Each component file is its own entry point. Multiple parts come from the same subpath.

---

## Compound parts and named exports

Compound components export their parts as named exports from the same file. Use them — don't reach for raw markup.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@keystoneui/react/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

---

## The `render` prop for custom triggers

Keystone UI uses Base UI under the hood. Base UI's slot equivalent is the **`render` prop**, not Radix's `asChild`.

```tsx
import { Button } from "@keystoneui/react/button";
import { Modal, ModalTrigger, ModalContent } from "@keystoneui/react/modal";

<Modal>
  <ModalTrigger render={<Button variant="secondary" />}>
    Open
  </ModalTrigger>
  <ModalContent>...</ModalContent>
</Modal>
```

Same pattern for `DropdownMenuTrigger`, `PopoverTrigger`, `TooltipTrigger`, `DrawerTrigger`, `AlertDialogTrigger`.

`render` accepts either a JSX element (its props are merged in) or a render function `(props) => ReactNode`. See [base-vs-radix.md](./base-vs-radix.md) for the full pattern and how it differs from Radix.

---

## Items always inside their group

Item components must be wrapped by their group/content parent. The library relies on this for keyboard navigation, ARIA roles, and styling.

```tsx
// Correct
<Select>
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectItem value="apple">Apple</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>

<DropdownMenu>
  <DropdownMenuTrigger>...</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

<Tabs>
  <TabsList>
    <TabsTrigger value="a">A</TabsTrigger>
    <TabsTrigger value="b">B</TabsTrigger>
  </TabsList>
  <TabsContent value="a">...</TabsContent>
</Tabs>
```

Never render `TabsTrigger` directly inside `Tabs` (must go in `TabsList`). Never render `SelectItem` outside `SelectContent`.

---

## Modal, Drawer, AlertDialog need a title

For accessibility. Use `ModalTitle` / `DrawerTitle` / `AlertDialogTitle`. If the title is not visually wanted, hide it with `className="sr-only"` — don't omit it.

```tsx
<Modal>
  <ModalTrigger render={<Button />}>Open</ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Confirm action</ModalTitle>
      <ModalDescription>This cannot be undone.</ModalDescription>
    </ModalHeader>
    <ModalFooter>
      <ModalClose render={<Button variant="secondary" />}>Cancel</ModalClose>
      <Button>Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

---

## Use full Card composition

Don't dump everything into `CardContent`. Use the proper parts.

**Incorrect:**

```tsx
<Card>
  <CardContent>
    <h2>Title</h2>
    <p>Description</p>
    <p>Body</p>
    <Button>Action</Button>
  </CardContent>
</Card>
```

**Correct:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

`Card` adjusts its own layout based on which parts are present (e.g. removes bottom padding when `CardFooter` exists, switches to a two-column grid when `CardAction` is present).

---

## `Button` has no loading prop — compose with `Spinner`

There is no `isLoading` / `isPending`. Compose:

```tsx
import { Button } from "@keystoneui/react/button";
import { Spinner } from "@keystoneui/react/spinner";

<Button disabled={isPending}>
  {isPending && <Spinner />}
  {isPending ? "Saving..." : "Save"}
</Button>
```

---

## `data-slot` for stable styling targets

Every exported component part has a `data-slot` attribute. Use it for consumer overrides — it survives internal refactors.

```css
[data-slot="card-title"] { font-size: 1.25rem; }
[data-slot="button"] { min-width: 100px; }
```

Naming is `[component]-[part]` kebab-case (`select-trigger`, `dropdown-menu-item`, `combobox-chips-input`). Root-level components use the component name alone (`card`, `button`).

`data-slot` also drives parent-aware layout (`has-data-[slot=card-footer]:pb-0`) and parent-to-child styling (`*:data-[slot=avatar]:ring-2`). Don't override `data-slot` values when extending components.

---

## Group naming for parent-child styling

Tailwind named groups follow the component's `data-slot` value: `group/card`, `group/input-group`, `group/tabs-list`. Children reference them via `group-data-[size=sm]/card:`, `group-has-disabled/field:`, etc. When extending, keep the group name aligned with the slot name.
