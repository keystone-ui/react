# @keystoneui/react

Accessible React component library built on [Base UI](https://base-ui.com) and
Tailwind CSS v4.

- **Documentation:** https://keystoneui.io/docs
- **Component gallery:** https://keystoneui.io/gallery
- **Blocks:** https://keystoneui.io/blocks

## Requirements

| Requirement | Version | Why |
| --- | --- | --- |
| React | `^19.2.0` | Peer dependency. React 18 is not supported. |
| React DOM | `^19.2.0` | Peer dependency. |
| Tailwind CSS | `4.x` | `base.css` uses v4-only at-rules (`@theme`, `@custom-variant`, `@apply`). There is no `tailwind.config.js` -- configuration is CSS-first. |
| Node | `>=22` | Matches the version the project builds and tests on. |

The package is **ESM-only** (`"type": "module"`) and side-effect free.

## Install

```bash
pnpm add @keystoneui/react
```

Then import the stylesheet **after** Tailwind in your CSS entry point:

```css
@import "tailwindcss";
@import "@keystoneui/react/base.css";
```

### `base.css` does not include colors

This is the one thing worth reading twice. `base.css` ships only structural
primitives: motion tokens (`--ease-*`, `--duration-*`), a named z-index scale
(`--z-modal`, `--z-popover`, ...), a radius scale derived from a single
`--radius`, keyframes, the `hover` custom variant, and the popup/drawer
enter-and-exit CSS.

It contains **no color tokens**. Colors are deliberately owned by your project,
not by a package dependency, so `--background`, `--foreground`, `--primary`,
`--border`, `--ring` and the rest must exist in your own CSS or every component
will render unstyled.

The fastest way to get a correct set is the registry, which writes the dark mode
variant, the Tailwind `@theme inline` registration, and the light/dark token
blocks straight into your CSS:

```bash
npx shadcn@latest add https://keystoneui.io/r/default.json
```

To swap the gray scale afterwards, add a theme instead of re-running the style:

```bash
npx shadcn@latest add https://keystoneui.io/r/themes/slate.json
```

Available themes: `default`, `zinc`, `slate`, `stone`, `gray`, `neutral`. See
[Theming](https://keystoneui.io/docs/theming) to write the tokens by hand.

Dark mode is class-based. The registry style installs
`@custom-variant dark (&:is(.dark *))`, so add `class="dark"` to a parent
element -- [next-themes](https://github.com/pacocoursey/next-themes) with
`attribute="class"` works out of the box.

## Usage

There is **no root export**. Every component is imported from its own subpath,
which keeps unused components out of your bundle:

```tsx
import { Button } from "@keystoneui/react/button";
import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";

export function SignIn() {
  return (
    <form className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <Button type="submit" fullWidth>
        Sign in
      </Button>
      <Button type="button" variant="ghost" size="sm">
        Use a magic link instead
      </Button>
    </form>
  );
}
```

Importing from `@keystoneui/react` itself will fail -- use
`@keystoneui/react/<component>`.

Two non-component subpaths are also exported:

```tsx
import { useMediaQuery } from "@keystoneui/react/hooks";
import { cn } from "@keystoneui/react/utils";
```

## Copy the source instead

Every component is also published as a
[shadcn](https://ui.shadcn.com/docs/registry)-compatible registry item, so you
can vendor the source into your own project rather than depending on the
package:

```bash
npx shadcn@latest add https://keystoneui.io/r/button.json
```

Register the namespace in `components.json` to install by name:

```json
{
  "registries": {
    "@keystone": "https://keystoneui.io/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @keystone/button
```

## AI agent tooling

An MCP server and CLI ([`@keystoneui/mcp`](https://www.npmjs.com/package/@keystoneui/mcp))
let agents search, view, and install components, and the docs site serves
[`/llms.txt`](https://keystoneui.io/llms.txt) and a packaged Agent Skill. See
[AI for Agents](https://keystoneui.io/docs/agents/mcp-server).

## License

MIT
