# CLI & Scripts

Two paths reach the same Keystone UI registry: the **shadcn CLI** (for installing source into a project) and the **bundled skill scripts** (for fetching docs and source from a shell).

## Installing components

Keystone UI ships a shadcn-compatible registry at `https://keystoneui.io/r/`. Install with the shadcn CLI:

```bash
# Single component
npx shadcn@latest add https://keystoneui.io/r/button.json

# Multiple components in one call
npx shadcn@latest add \
  https://keystoneui.io/r/button.json \
  https://keystoneui.io/r/card.json \
  https://keystoneui.io/r/input.json

# Theme / style preset
npx shadcn@latest add https://keystoneui.io/r/default.json
```

Use the project's package runner — `pnpm dlx shadcn@latest`, `bunx --bun shadcn@latest`, or `yarn dlx shadcn@latest` — based on `packageManager` in `package.json`.

To get the right URL for one or more components without typing it by hand, use the MCP `get_add_command` tool (see [mcp.md](./mcp.md)) or the local script:

```bash
node scripts/list_components.mjs   # list everything available
```

## Installing as an npm package

Keystone UI is also published as `@keystoneui/react`. Use this when you want the package as a dependency rather than vendored source:

```bash
npm install @keystoneui/react
# or
pnpm add @keystoneui/react
```

Then import via subpaths (see SKILL.md). You still need the base CSS:

```css
@import "tailwindcss";
@import "@keystoneui/react/base.css";
```

The npm-package and shadcn-registry paths are mutually exclusive within a project — pick one.

## Bundled skill scripts

The skill ships five Node scripts that hit the docs site and return text. Useful in any environment, including non-MCP clients.

| Script | Purpose | Example |
|---|---|---|
| `list_components.mjs` | List all components | `node scripts/list_components.mjs` |
| `get_component_docs.mjs` | Fetch full MDX docs for one or more components | `node scripts/get_component_docs.mjs button card` |
| `get_source.mjs` | Fetch component TSX source | `node scripts/get_source.mjs button` |
| `get_theme.mjs` | Theme variables (light/dark OKLCH) | `node scripts/get_theme.mjs` |
| `get_docs.mjs` | Non-component docs (guides, theming) | `node scripts/get_docs.mjs /docs/theming` |

Each script accepts space-separated arguments where applicable. Output is plain text suitable for piping into agent context.

## Direct MDX URLs

When neither MCP nor the scripts fit, fetch MDX directly:

- Component docs — `https://keystoneui.io/docs/components/{name}.mdx`
- Guides — `https://keystoneui.io/docs/{topic}.mdx`
- Plain-text indexes — `/llms.txt`, `/llms-full.txt`, `/llms-components.txt`
- Project guidance — `/AGENTS.md`

Examples:

- `https://keystoneui.io/docs/components/button.mdx`
- `https://keystoneui.io/docs/components/modal.mdx`
- `https://keystoneui.io/docs/installation/quick-start.mdx`

Always fetch component docs **before** writing complex components. The MDX includes complete examples, props, anatomy, and API references.

## Choosing between MCP and scripts

- Working in Claude Code, Cursor, VS Code Copilot, OpenCode, or Codex → use MCP. It's faster and structured.
- Working in a shell, CI, or a non-MCP client → use the scripts.
- Need raw MDX → fetch the `.mdx` URLs directly.

All three paths return the same source-of-truth content from the docs site.
