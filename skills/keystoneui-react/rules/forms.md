# Forms & Inputs

Keystone UI ships **two complementary form patterns**. Use whichever fits — they're not mutually exclusive within an app, but pick one per form.

## Contents

- Two patterns: lightweight (`/form`) vs rich (`/field`)
- `<Form>` renders a `<form>` element
- Choosing a form control
- `InputGroup` requires `InputGroupInput` / `InputGroupTextarea`
- Buttons inside inputs use `InputGroupAddon`
- Option sets (2–7 choices) use `ToggleGroup`
- `FieldSet` + `FieldLegend` for grouped controls
- Validation — `aria-invalid` on the control + an error component
- Disabled state — `disabled` on the control; `data-disabled` on `Field` dims `FieldLabel`

---

## Two patterns

### Lightweight — `@keystoneui/react/form`

`Form`, `FieldGroup`, `Label`, `Description`, `ErrorMessage`. You own row markup with `space-y-1.5` divs. Best for simple forms.

```tsx
import { Form, FieldGroup, Label, Description, ErrorMessage } from "@keystoneui/react/form";
import { Input } from "@keystoneui/react/input";
import { Button } from "@keystoneui/react/button";

<Form onSubmit={handleSubmit}>
  <div className="space-y-1.5">
    <Label htmlFor="email">Email</Label>
    <Input id="email" name="email" type="email" />
    <Description>We'll never share your email.</Description>
  </div>
  <Button type="submit">Sign in</Button>
</Form>
```

### Rich — `@keystoneui/react/field`

`Field`, `FieldGroup`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldSet`, `FieldLegend`, `FieldContent`, `FieldSeparator`. The `Field` wrapper provides slot styling, disabled-state propagation to the label, orientation, and full block-level structure. Best for production forms, settings pages, and the signin/signup blocks.

```tsx
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import { Button } from "@keystoneui/react/button";

<form onSubmit={handleSubmit}>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" name="email" type="email" />
      <FieldDescription>We'll never share your email.</FieldDescription>
    </Field>
    <Field>
      <FieldLabel htmlFor="password">Password</FieldLabel>
      <Input id="password" name="password" type="password" />
    </Field>
  </FieldGroup>
  <Button type="submit">Sign in</Button>
</form>
```

You can use `<Form>` (the `<form>` element) on the outside and the rich `Field` wrappers inside — the patterns compose.

---

## `<Form>` renders a `<form>` element

`Form` is a real `<form>` element accepting `onSubmit` and any `FormHTMLAttributes<HTMLFormElement>`. Nested inputs submit on Enter without extra wiring.

`FieldGroup` (from `/form` or `/field`) renders a `<div>` with the same vertical spacing as `Form`. Use it inside an existing `<form>` or for non-submitting layouts (settings panels, nested groups).

---

## Choosing a form control

| Need | Use |
|---|---|
| Simple text | `Input` |
| Multi-line text | `Textarea` |
| Dropdown with predefined options | `Select` |
| Searchable dropdown | `Combobox` |
| Native select (no JS popup) | `NativeSelect` |
| Boolean (settings-style) | `Switch` |
| Boolean (forms-style) | `Checkbox` |
| Single choice from a few options | `RadioGroup` |
| Toggle between 2–5 options | `ToggleGroup` + `ToggleGroupItem` |
| OTP / verification code | `InputOTP` |
| Date | `DateInput` |
| Calendar picker | `Calendar` |

---

## `InputGroup` requires `InputGroupInput` / `InputGroupTextarea`

Never put a raw `Input` or `Textarea` inside an `InputGroup`. Use `InputGroupInput` and `InputGroupTextarea` instead.

```tsx
import { InputGroup, InputGroupInput } from "@keystoneui/react/input-group";

<InputGroup>
  <InputGroupInput placeholder="Search..." />
</InputGroup>
```

---

## Buttons inside inputs use `InputGroupAddon`

Don't position buttons over inputs with `absolute`. Use `InputGroupAddon` (and optionally `InputGroupButton`).

```tsx
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@keystoneui/react/input-group";
import { Search } from "lucide-react";

<InputGroup>
  <InputGroupInput placeholder="Search..." />
  <InputGroupAddon>
    <InputGroupButton>
      <Search />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

`InputGroupAddon` handles inline-start, inline-end, block-start, block-end alignment via `data-align`. `InputGroupText` is also available for non-button addons (currency symbols, units).

---

## Option sets (2–7 choices) use `ToggleGroup`

Don't loop `Button` components with active state.

```tsx
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";

<ToggleGroup>
  <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
  <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
  <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
</ToggleGroup>
```

For labelled groups, wrap with `Field` (rich pattern):

```tsx
<Field orientation="horizontal">
  <FieldLabel id="theme-label">Theme</FieldLabel>
  <ToggleGroup aria-labelledby="theme-label">
    <ToggleGroupItem value="light">Light</ToggleGroupItem>
    <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
    <ToggleGroupItem value="system">System</ToggleGroupItem>
  </ToggleGroup>
</Field>
```

> **Note:** `ToggleGroup`'s controlled-state and multi-select props differ from Radix. See [base-vs-radix.md](./base-vs-radix.md).

---

## `FieldSet` + `FieldLegend` for grouped controls

For related checkboxes / radios / switches with a common heading, use `FieldSet` + `FieldLegend`. Don't use a plain `div` and a heading element.

`FieldLegend` accepts `variant="legend"` (default, larger) or `variant="label"` (smaller, for inline forms).

```tsx
<FieldSet>
  <FieldLegend variant="label">Preferences</FieldLegend>
  <FieldDescription>Select all that apply.</FieldDescription>
  <FieldGroup className="gap-3">
    <Field orientation="horizontal">
      <Checkbox id="dark" />
      <FieldLabel htmlFor="dark">Dark mode</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <Checkbox id="notifications" />
      <FieldLabel htmlFor="notifications">Email notifications</FieldLabel>
    </Field>
  </FieldGroup>
</FieldSet>
```

---

## Validation — `aria-invalid` on the control, error message component

Validation styling lives on the control via `aria-invalid` (which triggers destructive border / ring). The error text is a separate component.

**Lightweight pattern:**

```tsx
<div className="space-y-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" aria-invalid />
  <ErrorMessage>Invalid email address.</ErrorMessage>
</div>
```

**Rich pattern:**

```tsx
<Field>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid />
  <FieldError>Invalid email address.</FieldError>
</Field>
```

`FieldError` also accepts an `errors` array prop for react-hook-form-style integration; pass `errors={[{ message: "..." }]}` instead of children when you have a list.

> Don't put `data-invalid` on `Field` — Keystone UI's `Field` doesn't style based on it. Use `aria-invalid` on the control.

---

## Disabled state — `disabled` on the control; `data-disabled` on `Field` dims the label

The control styles itself when `disabled`. To dim the `FieldLabel` and visually associate the disabled state at the row level, also set `data-disabled` on the parent `Field` — `FieldLabel` reacts via the `group/field` selector.

```tsx
<Field data-disabled>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" disabled />
</Field>
```

In the lightweight pattern, just set `disabled` on the control. There's no group wrapper to coordinate with.
