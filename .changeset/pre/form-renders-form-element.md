---
"@keystoneui/react": major
---

**Breaking: `<Form>` now renders a real `<form>` element.**

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
