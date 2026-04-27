# Icons

## Use `lucide-react` for all icons

Keystone UI standardizes on `lucide-react`. Don't use `@iconify/react`, `@remixicon/react`, `react-icons`, or any other icon library inside component or app code.

```tsx
import { ChevronDown, Search, X } from "lucide-react";
```

If you need a brand or social icon that lucide doesn't provide, ask the user before reaching for another library.

---

## No sizing classes on icons inside library components

Keystone UI components handle icon sizing via CSS (the SVG boilerplate `[&_svg:not([class*='size-'])]:size-4`). Don't add `size-4`, `w-4 h-4`, `mr-2`, etc. on icons inside `Button`, `DropdownMenuItem`, `SelectItem`, `ComboboxItem`, `Alert`, or any other Keystone component — unless you explicitly want a non-default size.

**Incorrect:**

```tsx
<Button>
  <Search className="mr-2 size-4" />
  Search
</Button>

<DropdownMenuItem>
  <Settings className="mr-2 size-4" />
  Settings
</DropdownMenuItem>
```

**Correct:**

```tsx
<Button>
  <Search />
  Search
</Button>

<DropdownMenuItem>
  <Settings />
  Settings
</DropdownMenuItem>
```

If you need a custom size, the `size-*` escape hatch lets you override:

```tsx
<Button>
  <Search className="size-5" />
  Search
</Button>
```

---

## Pass icons as components, not string keys

Use `icon={Check}`, not a string key into a lookup map.

**Incorrect:**

```tsx
const iconMap = { check: Check, alert: AlertTriangle };

function Status({ icon }: { icon: keyof typeof iconMap }) {
  const Icon = iconMap[icon];
  return <Icon />;
}

<Status icon="check" />;
```

**Correct:**

```tsx
import { Check } from "lucide-react";

function Status({ icon: Icon }: { icon: React.ComponentType }) {
  return <Icon />;
}

<Status icon={Check} />;
```

---

## Stories may use `@remixicon/react` for brand glyphs

Storybook stories sometimes import brand or social icons from `@remixicon/react`. That's acceptable in `apps/storybook/stories/**`. Don't import `@remixicon/react` from component source in `packages/ui/src/`.
