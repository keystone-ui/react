---
name: keystoneui-react
description: "Keystone UI React component library (Tailwind CSS v4 + Base UI). Use when working with Keystone UI components, installing Keystone UI, customizing themes, or accessing component documentation. Keywords: Keystone UI, keystoneui, @keystoneui/react, Base UI, Tailwind v4."
metadata:
  author: keystoneui
  version: "1.0.0"
---

# Keystone UI React Development Guide

Keystone UI is a production-ready React component library built on **Tailwind CSS v4** and **Base UI** (`@base-ui/react`), providing 50+ accessible, customizable components with OKLCH color tokens and dark mode support.

---

## Core Principles

- **Subpath imports** — Always import from `@keystoneui/react/{component}`, never from `@keystoneui/react`
- **Tailwind CSS v4** — CSS-first configuration with OKLCH color space
- **Base UI primitives** — Built on `@base-ui/react`, NOT Radix UI
- **CVA variants** — Styling via `class-variance-authority` + `tailwind-merge`
- **Named exports** — Components export named parts (e.g., `Card`, `CardHeader`, `CardTitle`)
- **`data-slot` attributes** — Every component part has a stable `data-slot` for CSS targeting

---

## Installation

```bash
npm i @keystoneui/react
# or
pnpm add @keystoneui/react
```

### CSS Setup

Add to your global CSS file (order matters):

```css
@import "tailwindcss";
@import "@keystoneui/react/base.css";
```

Then configure your theme tokens (see Theming section below).

### shadcn Registry (Alternative)

```bash
npx shadcn add https://keystoneui.io/r/default.json
```

---

## Import Pattern

Always use subpath imports:

```tsx
import { Button } from "@keystoneui/react/button";
import { Card, CardHeader, CardTitle, CardContent } from "@keystoneui/react/card";
import { Input } from "@keystoneui/react/input";
import { Modal, ModalTrigger, ModalContent } from "@keystoneui/react/modal";
```

**Never** use barrel imports:

```tsx
// WRONG — this does not exist
import { Button } from "@keystoneui/react";
```

---

## Component List

All 53 components with their import paths:

| Component | Import Path |
|---|---|
| Accordion | `@keystoneui/react/accordion` |
| Alert | `@keystoneui/react/alert` |
| AlertDialog | `@keystoneui/react/alert-dialog` |
| AspectRatio | `@keystoneui/react/aspect-ratio` |
| Avatar | `@keystoneui/react/avatar` |
| Badge | `@keystoneui/react/badge` |
| Breadcrumb | `@keystoneui/react/breadcrumb` |
| Button | `@keystoneui/react/button` |
| ButtonGroup | `@keystoneui/react/button-group` |
| Calendar | `@keystoneui/react/calendar` |
| Card | `@keystoneui/react/card` |
| Carousel | `@keystoneui/react/carousel` |
| Checkbox | `@keystoneui/react/checkbox` |
| CircularProgress | `@keystoneui/react/circular-progress` |
| Collapsible | `@keystoneui/react/collapsible` |
| Combobox | `@keystoneui/react/combobox` |
| Command | `@keystoneui/react/command` |
| DateInput | `@keystoneui/react/date-input` |
| DescriptionList | `@keystoneui/react/description-list` |
| Drawer | `@keystoneui/react/drawer` |
| DropdownMenu | `@keystoneui/react/dropdown-menu` |
| Empty | `@keystoneui/react/empty` |
| Field | `@keystoneui/react/field` |
| Form | `@keystoneui/react/form` |
| Input | `@keystoneui/react/input` |
| InputGroup | `@keystoneui/react/input-group` |
| InputOTP | `@keystoneui/react/input-otp` |
| Item | `@keystoneui/react/item` |
| Kbd | `@keystoneui/react/kbd` |
| Label | `@keystoneui/react/label` |
| Modal | `@keystoneui/react/modal` |
| NativeSelect | `@keystoneui/react/native-select` |
| Pagination | `@keystoneui/react/pagination` |
| Popover | `@keystoneui/react/popover` |
| Progress | `@keystoneui/react/progress` |
| RadioGroup | `@keystoneui/react/radio-group` |
| Resizable | `@keystoneui/react/resizable` |
| Select | `@keystoneui/react/select` |
| Separator | `@keystoneui/react/separator` |
| Skeleton | `@keystoneui/react/skeleton` |
| Slider | `@keystoneui/react/slider` |
| Spinner | `@keystoneui/react/spinner` |
| Stepper | `@keystoneui/react/stepper` |
| Switch | `@keystoneui/react/switch` |
| Table | `@keystoneui/react/table` |
| Tabs | `@keystoneui/react/tabs` |
| Tag | `@keystoneui/react/tag` |
| TagGroup | `@keystoneui/react/tag-group` |
| Textarea | `@keystoneui/react/textarea` |
| Toast | `@keystoneui/react/toast` |
| Toggle | `@keystoneui/react/toggle` |
| ToggleGroup | `@keystoneui/react/toggle-group` |
| Tooltip | `@keystoneui/react/tooltip` |

---

## Component Architecture

### Named Exports (Not Default)

Components export named parts at the bottom of each file:

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@keystoneui/react/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

### `data-slot` for Styling

Every component part has a `data-slot` attribute for stable CSS targeting:

```css
[data-slot="card-title"] { font-size: 1.25rem; }
[data-slot="button"] { min-width: 100px; }
```

### Icons

Use `lucide-react` for all icons:

```tsx
import { ChevronDown } from "lucide-react";
```

---

## Theming

Keystone UI uses CSS custom properties with OKLCH color space. Define tokens in your CSS:

### Light Mode Tokens

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.971 0.013 17.38);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --radius: 0.625rem;
}
```

### Dark Mode Tokens

```css
.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.971 0.013 17.38);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
  --radius: 0.625rem;
}
```

### Color Naming Convention

- Without suffix = background (e.g., `bg-primary`)
- With `-foreground` = text color (e.g., `text-primary-foreground`)

### Radius Scale

A single `--radius` variable drives the entire scale:

| Utility | Formula | Default |
|---|---|---|
| `rounded-sm` | `--radius - 4px` | 6px |
| `rounded-md` | `--radius - 2px` | 8px |
| `rounded-lg` | `--radius` | 10px |
| `rounded-xl` | `--radius + 4px` | 14px |
| `rounded-2xl` | `--radius + 8px` | 18px |

### Dark Mode

Toggle dark mode by adding the `dark` class to a parent element:

```html
<html class="dark">
```

---

## Accessing Documentation & Source Code

For detailed per-component documentation (props, examples, anatomy), use the bundled scripts:

### Using Scripts

```bash
# List all available components
node scripts/list_components.mjs

# Get component documentation (MDX with examples)
node scripts/get_component_docs.mjs button
node scripts/get_component_docs.mjs button card select

# Get component source code (TSX)
node scripts/get_source.mjs button
node scripts/get_source.mjs button accordion card

# Get theme variables
node scripts/get_theme.mjs

# Get non-component docs (guides, theming)
node scripts/get_docs.mjs /docs/theming
node scripts/get_docs.mjs /docs/installation/quick-start
```

### Direct MDX URLs

Component docs: `https://keystoneui.io/docs/components/{component-name}.mdx`

Examples:

- Button: `https://keystoneui.io/docs/components/button.mdx`
- Modal: `https://keystoneui.io/docs/components/modal.mdx`
- Select: `https://keystoneui.io/docs/components/select.mdx`

Getting started guides: `https://keystoneui.io/docs/{topic}.mdx`

**Always fetch component docs before implementing complex components.** The MDX docs include complete examples, props, anatomy, and API references.

---

## Common Patterns

### Form with Validation

```tsx
import { Button } from "@keystoneui/react/button";
import { Field, FieldLabel, FieldMessage } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

<form>
  <Field>
    <FieldLabel>Email</FieldLabel>
    <Input type="email" placeholder="name@example.com" />
    <FieldMessage>We'll never share your email.</FieldMessage>
  </Field>
  <Button type="submit">Submit</Button>
</form>
```

### Modal Dialog

```tsx
import { Button } from "@keystoneui/react/button";
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose } from "@keystoneui/react/modal";

<Modal>
  <ModalTrigger render={<Button />}>Open Modal</ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Confirm Action</ModalTitle>
      <ModalDescription>This cannot be undone.</ModalDescription>
    </ModalHeader>
    <ModalFooter>
      <ModalClose render={<Button variant="secondary" />}>Cancel</ModalClose>
      <Button>Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Dropdown Menu

```tsx
import { Button } from "@keystoneui/react/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@keystoneui/react/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="secondary" />}>
    Options
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Key Constraints

- **No Radix UI** — use `@base-ui/react` for all primitives
- **Subpath imports only** — `@keystoneui/react/button`, never `@keystoneui/react`
- **No `transition-all`** — specify exact transition properties
- **No raw color values** — use semantic tokens (`bg-primary`, `text-muted-foreground`)
- **Explicit `cursor-pointer`** on interactive elements (Tailwind v4 changed the default)
- **`lucide-react`** for all icons
