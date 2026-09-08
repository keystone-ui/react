---
"@keystoneui/react": minor
---

`toast`: a bare message is now the **description**, and `title` is opt-in.

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
