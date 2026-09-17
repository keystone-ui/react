# Composition

How Keystone UI components are composed and how to extend them.

## Contents

- Imports follow the project's install mode
- Subpath imports — never barrel imports
- Compound parts and named exports
- The `render` prop for custom triggers
- Items always inside their group
- Modal, Drawer, AlertDialog need a title
- Footer actions: cancel first, primary last
- Drawer bodies scroll — use `DrawerBody`
- Use full Card composition
- `Button` has no loading prop — compose with `Spinner`
- `data-slot` for stable styling targets
- Client components in an RSC project

---

## Imports follow the project's install mode

Keystone is dual-distribution, and import style depends on which path the
project took. Read `installMode` from the project context before writing the
first import — see [SKILL.md](../SKILL.md#current-project-context).

**Incorrect** — assuming the package is installed when the project vendored the
source:

```tsx
// installMode: "registry" — @keystoneui/react is not a dependency here.
import { Button } from "@keystoneui/react/button";
```

**Correct** — use the project's own `aliases.ui`:

```tsx
// installMode: "registry", aliases.ui: "@/components/ui"
import { Button } from "@/components/ui/button";
```

Do not hardcode `@/`. A monorepo commonly uses something like
`@workspace/ui/components`, and `aliases.ui` is what says so.

---

## Subpath imports — never barrel imports

**This section applies when `installMode` is `package`.** There is no barrel
file, so always import from the per-component subpath.

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

For the `morphing` variant on `TabsList`, wrap each trigger's text in `<TabsTriggerLabel>` so it can collapse to width 0 when inactive. Triggers should also include an icon so the collapsed state stays meaningful. Outside morphing mode `TabsTriggerLabel` is a no-op wrapper.

```tsx
<TabsList morphing>
  <TabsTrigger value="home"><HomeIcon /><TabsTriggerLabel>Home</TabsTriggerLabel></TabsTrigger>
</TabsList>
```

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

## Footer actions: cancel first, primary last

`ModalFooter`, `DrawerFooter` and `AlertDialogFooter` right-align on `sm:` and
up, so the last child sits furthest right — where the eye lands and the thumb
rests. Put the primary action there and the dismissive one before it.

**Incorrect:**

```tsx
<ModalFooter>
  <Button>Confirm</Button>
  <ModalClose render={<Button variant="outline" />}>Cancel</ModalClose>
</ModalFooter>
```

**Correct:**

```tsx
<ModalFooter>
  <ModalClose render={<Button variant="outline" />}>Cancel</ModalClose>
  <Button>Confirm</Button>
</ModalFooter>
```

The same order applies to `AlertDialogCancel` before `AlertDialogAction`, to
`DrawerClose` before the submit button, and to a wizard's Back before its Next.
`ModalFooter`'s built-in `showCloseButton` renders ahead of `children` for the
same reason.

These footers are `flex-col-reverse` below `sm:`, so this DOM order also stacks
the primary action on top on mobile — reverse it and the primary ends up buried
under the cancel.

A form's own action row follows the same order even though it is left-aligned —
`<Field orientation="horizontal">` has no `justify-end`, but `Cancel` still
comes before `Submit`, so the primary is the rightmost button everywhere in the
library.

---

## Drawer bodies scroll — use `DrawerBody`

`DrawerContent` already scrolls its own content, so long forms are never clipped.
Don't hand-roll a scroll container. When the header and footer should stay pinned
while only the middle scrolls, reach for `DrawerBody`.

**Incorrect:**

```tsx
<DrawerContent>
  <DrawerHeader>
    <DrawerTitle>Edit profile</DrawerTitle>
  </DrawerHeader>
  <div className="max-h-[60vh] overflow-y-auto px-4">{fields}</div>
  <DrawerFooter>
    <Button>Save</Button>
  </DrawerFooter>
</DrawerContent>
```

**Correct:**

```tsx
<DrawerContent>
  <DrawerHeader>
    <DrawerTitle>Edit profile</DrawerTitle>
  </DrawerHeader>
  <DrawerBody>{fields}</DrawerBody>
  <DrawerFooter>
    <Button>Save</Button>
  </DrawerFooter>
</DrawerContent>
```

`DrawerBody` ships `px-4` only — `DrawerHeader` and `DrawerFooter` supply their
own vertical padding, so add `py-*` yourself only when the body stands alone.

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

**It does not survive `render`.** A component composed into a trigger emits the
*trigger's* slot, because `render` merges the trigger's props over the rendered
element's:

```tsx
<DropdownMenuTrigger render={<Button />}>Open</DropdownMenuTrigger>
// → data-slot="dropdown-menu-trigger", never "button"
```

So `[data-slot="button"]` misses every button used as a trigger — and `render`
is the idiom this library recommends over `asChild`. Target the trigger's slot
(`[data-slot="dropdown-menu-trigger"]`), or give the element a class or an
attribute of your own. `Badge`, `Item`, `Breadcrumb` and `TableSortButton` use
`useRender` with an explicit `state.slot`, and those *do* keep their slot when
given a `render` element — the difference is whether the component owns the
render call or is passed into someone else's.

Naming is `[component]-[part]` kebab-case (`select-trigger`, `dropdown-menu-item`, `combobox-chips-input`). Root-level components use the component name alone (`card`, `button`).

`data-slot` also drives parent-aware layout (`has-data-[slot=card-footer]:pb-0`) and parent-to-child styling (`*:data-[slot=avatar]:ring-2`). Don't override `data-slot` values when extending components.

---

## Group naming for parent-child styling

Tailwind named groups follow the component's `data-slot` value: `group/card`, `group/input-group`, `group/tabs-list`. Children reference them via `group-data-[size=sm]/card:`, `group-has-disabled/field:`, etc. When extending, keep the group name aligned with the slot name.

---

## Tooltip is decoration, not information

Base UI's tooltip wires **no** `aria-describedby` and **no** `role` — the only
`aria-*` attribute in its whole implementation is `aria-hidden` on the arrow —
and its trigger is mouse-only. A `Tooltip` is therefore announced to no screen
reader and opens on no touch device. It *is* keyboard-reachable, which is what
makes the gap easy to miss.

**Never put information in a Tooltip that is not available elsewhere.** Tooltips
on an icon button whose `aria-label` already says the same thing are fine; a
tooltip that is the only place a metric's definition appears is not.

When the tooltip must carry the only copy of some text, all three of these are
required:

1. Render the text in an always-present `<span className="sr-only">` and point
   the trigger's `aria-describedby` at it. Pointing at the popup dangles — it is
   unmounted while closed.
2. Mark the popup `aria-hidden="true"`, or the string is in the accessibility
   tree twice while open.
3. Control `open` and toggle it on click so touch works, passing
   `closeOnClick={false}` so the trigger's own click-to-close does not fight the
   toggle.

See the Info Tip example in the Tooltip docs.

---

## Client components in an RSC project

When the project context reports `isRSC: true`, any file that uses `useState`,
`useEffect`, an event handler, or a browser API needs the `"use client"`
directive. Most Keystone components are interactive, so in an RSC project this
applies to nearly every file that renders one.

**Incorrect** — a Server Component that renders interactive children and wires
up state:

```tsx
import { useState } from "react";
import { Modal, ModalTrigger, ModalContent } from "@keystoneui/react/modal";

export function EditDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Modal onOpenChange={setOpen} open={open}>
      <ModalTrigger render={<Button />}>Edit</ModalTrigger>
      <ModalContent>…</ModalContent>
    </Modal>
  );
}
```

**Correct:**

```tsx
"use client";

import { useState } from "react";
import { Modal, ModalTrigger, ModalContent } from "@keystoneui/react/modal";

export function EditDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Modal onOpenChange={setOpen} open={open}>
      <ModalTrigger render={<Button />}>Edit</ModalTrigger>
      <ModalContent>…</ModalContent>
    </Modal>
  );
}
```

The failure is not subtle — the build errors out — but it costs a cycle every
time. Put the directive on the leaf component that needs it rather than on a
page, so the server boundary stays as low in the tree as possible.
