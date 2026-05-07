# CLI & Scripts

Three paths reach the same Keystone UI registry: the **`keystoneui` CLI** (unified verb-based interface — preferred), the **shadcn CLI** (for installing source into a project), and the **bundled skill scripts** (legacy / non-MCP fallback).

## `keystoneui` CLI (preferred)

The `@keystoneui/mcp` package ships a single binary that runs in two modes — without arguments it launches the MCP stdio server, with a verb it acts as a CLI. Available as `keystoneui` (alias) or `keystoneui-mcp` (canonical).

```bash
# Discover
keystoneui search "table pagination"
keystoneui search signin --type block
keystoneui list --type example --limit 20

# Inspect
keystoneui view button
keystoneui docs button             # fetches /llms.mdx/docs/components/button
keystoneui examples table          # all demo files for the table component

# Install (delegates to shadcn CLI; see below)
npx shadcn@latest add https://keystoneui.io/r/table-with-pagination.json

# Verify
keystoneui audit                   # post-install checklist

# Configure MCP client
keystoneui init --client claude    # or cursor | vscode | codex | opencode
```

The CLI/MCP modes share the same registry data and search behavior. Use the CLI when working in a shell or non-MCP environment; the MCP server when working in Claude Code, Cursor, VS Code Copilot, OpenCode, or Codex.

When `@keystoneui/mcp` is published, the same verbs work as `npx keystoneui <verb>` for downstream users.

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

## Bundled skill scripts (fallback)

These predate the unified `keystoneui` CLI and are kept for environments where the MCP package isn't installed. The CLI verbs above cover the same surface and should be preferred.

| Script | Purpose | Example |
|---|---|---|
| `list_components.mjs` | List all components | `node scripts/list_components.mjs` |
| `get_component_docs.mjs` | Fetch full MDX docs for one or more components | `node scripts/get_component_docs.mjs button card` |
| `get_source.mjs` | Fetch component TSX source | `node scripts/get_source.mjs button` |
| `get_theme.mjs` | Theme variables (light/dark OKLCH) | `node scripts/get_theme.mjs` |
| `get_docs.mjs` | Non-component docs (guides, theming) | `node scripts/get_docs.mjs /docs/theming` |

Each script accepts space-separated arguments where applicable. Output is plain text suitable for piping into agent context.

## Direct MDX URLs

When neither MCP nor the scripts fit, fetch MDX directly. **Prefer the LLM-resolved routes** — they inline `<ComponentPreview>` tags as actual TSX source so a single fetch gives you both prose and code.

**LLM-resolved (preferred for agents):**

- Per-component — `https://keystoneui.io/llms.mdx/docs/components/{name}` (e.g. `…/components/button`, `…/components/table`)
- Per-block — `https://keystoneui.io/llms.mdx/docs/blocks/{name}` (e.g. `…/blocks/signin-01`, `…/blocks/tickets-01`)
- All components in one document — `https://keystoneui.io/llms-components.txt`
- Full docs site — `https://keystoneui.io/llms-full.txt`
- Index of pages — `https://keystoneui.io/llms.txt`

**Raw MDX (when you specifically need the unresolved tags):**

- Component docs — `https://keystoneui.io/docs/components/{name}.mdx`
- Guides — `https://keystoneui.io/docs/{topic}.mdx`
- Project guidance — `https://keystoneui.io/AGENTS.md`

Examples:

- `https://keystoneui.io/llms.mdx/docs/components/button` — Button docs with all preview source inlined
- `https://keystoneui.io/llms.mdx/docs/components/table` — Table docs (includes the "With Pagination" section as runnable TSX)
- `https://keystoneui.io/llms.mdx/docs/blocks/tickets-01` — Tickets block with full source

Always fetch component docs **before** writing complex components. The MDX includes complete examples, props, anatomy, and API references.

## Choosing a path

- Claude Code, Cursor, VS Code Copilot, OpenCode, Codex → MCP (auto-loads via `.mcp.json`).
- Shell, CI, or a non-MCP client → `keystoneui <verb>` (preferred) or the bundled `.mjs` scripts (fallback).
- Need raw MDX → fetch the `.mdx` URLs directly, or use `keystoneui docs <name>` for the LLM-resolved version.

All paths return the same source-of-truth content from the docs site.
