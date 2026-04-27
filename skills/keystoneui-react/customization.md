# Customization & Theming

How to set up Tailwind, define theme tokens, switch between light/dark, and add new tokens. Token values are OKLCH; semantic names follow the shadcn convention.

## CSS setup

Order matters. Import Tailwind first, then Keystone UI's base CSS.

```css
/* globals.css (or your CSS entry point) */
@import "tailwindcss";
@import "@keystoneui/react/base.css";
```

`base.css` ships:

- The `@custom-variant dark (&:is(.dark *))` setup so `.dark` ancestors enable dark mode.
- Hover gating via `@media (hover: hover)` so `hover:` styles only fire on devices that support hover.
- Animations and transitions (Accordion, popups).
- The `@theme inline` block that registers the radius scale, motion tokens, and z-scale derived from your CSS variables.

You define the actual token **values** below. The package owns the runtime CSS; you own the design tokens.

## Light mode tokens

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

## Dark mode tokens

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
}
```

## Color naming convention

Pairs follow `--name` (background) and `--name-foreground` (text). The `bg-*` utility uses `--name`; the `text-*-foreground` utility uses `--name-foreground`.

| Token | Background | Text |
|---|---|---|
| `--primary` | `bg-primary` | `text-primary-foreground` |
| `--secondary` | `bg-secondary` | `text-secondary-foreground` |
| `--destructive` | `bg-destructive` | `text-destructive-foreground` |
| `--muted` | `bg-muted` | `text-muted-foreground` |
| `--accent` | `bg-accent` | `text-accent-foreground` |
| `--card` | `bg-card` | `text-card-foreground` |
| `--popover` | `bg-popover` | `text-popover-foreground` |

When adding a new color pair, follow this convention.

## Custom tokens beyond shadcn

Keystone UI defines a few extra tokens used by specific components.

- `--input-bg` — form control background. Transparent in light, `input` at 30% in dark. Use `bg-input-bg`. Do not use `bg-transparent dark:bg-input/30`.
- `--popup-ring` — subtle ring on popup containers (`border` at 10% opacity). Use `ring-popup-ring`.
- `--border-muted` — popup separators (lower contrast than `--border`).

**Where they come from depends on install path:**

- **shadcn registry** (`npx shadcn@latest add https://keystoneui.io/r/default.json`) — these tokens are baked into `packages/ui/registry/default.json` and added to your CSS automatically.
- **npm package** (`pnpm add @keystoneui/react`) — you must add these tokens manually to your `:root` and `.dark` blocks alongside the shadcn-style tokens above. Skip them and popup components and form controls won't render correctly in dark mode.

## Radius scale

A single `--radius` variable drives the whole scale. Default is `0.625rem` (10px). Change it once and the entire UI adjusts.

| Utility | Formula | Default |
|---|---|---|
| `rounded-sm` | `--radius - 4px` | 6px |
| `rounded-md` | `--radius - 2px` | 8px |
| `rounded-lg` | `--radius` | 10px |
| `rounded-xl` | `--radius + 4px` | 14px |
| `rounded-2xl` | `--radius + 8px` | 18px |

Components use the utility classes (`rounded-md`, `rounded-lg`) — never hardcoded pixel values. For bespoke offsets, use `calc(var(--radius) ± Npx)`.

## Dark mode

Add the `dark` class to a parent element (typically `<html>`):

```html
<html class="dark">
```

Or wire it to a theme provider (e.g. `next-themes`). The `@custom-variant dark (&:is(.dark *))` declaration in `base.css` makes `dark:` Tailwind utilities resolve correctly.

## Adding a new theme token

1. **Define** the variable in `:root` and `.dark`:

```css
:root  { --my-token: oklch(0.5 0.1 200); }
.dark  { --my-token: oklch(0.3 0.1 200); }
```

2. **Register** with Tailwind in your `@theme inline` block:

```css
@theme inline {
  --color-my-token: var(--my-token);
}
```

3. **Use** via Tailwind utilities:

```
bg-my-token text-my-token border-my-token
```

If your token represents a background+foreground pair, follow the convention: `--my-token` (background) and `--my-token-foreground` (text).

## Motion and layering tokens

Defined in `base.css`. Use in custom code rather than hard-coded durations or z-indexes.

- Durations — `--duration-fast`, `--duration-base`, `--duration-slow`, `--duration-drawer`
- Easings — `--ease-out`, `--ease-in-out`, `--ease-drawer`
- Z-scale — `--z-sticky`, `--z-drawer` (40), `--z-modal` (50), `--z-dropdown`, `--z-popover` (60), `--z-tooltip` (70), `--z-toast` (80)

Library overlay components manage their own stacking; don't add `z-50` manually. See [rules/styling.md](./rules/styling.md#motion-and-layering-tokens).

## Switching between npm package and shadcn registry

Two install paths exist (see [cli.md](./cli.md)). They produce equivalent runtime behavior but mutually exclusive within a single project. Pick one based on whether you want the components as a vendored copy you can edit (shadcn registry) or as a versioned dependency (npm package).
