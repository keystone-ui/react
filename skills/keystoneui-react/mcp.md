# MCP Server

Keystone UI ships an MCP server that lets agents discover, search, view, and install components without screen-scraping the docs.

## Setup

Add the server to your client config. The package is `@keystoneui/mcp`.

**Claude Code** — `.mcp.json`:

```json
{
  "mcpServers": {
    "keystoneui": {
      "command": "npx",
      "args": ["-y", "@keystoneui/mcp"]
    }
  }
}
```

**Cursor** — `.cursor/mcp.json` uses the same shape. Same for VS Code (`.vscode/mcp.json`), OpenCode, Codex.

You can also run the init helper from the `@keystoneui/mcp` package to write the config for you. See the docs at `https://keystoneui.io/docs/agents/mcp-server` for client-specific commands.

## Tools

| Tool | When to use |
|---|---|
| `get_project_context` | **Call first.** Install mode, path aliases, theme CSS file, icon library, RSC, package manager. Import style depends on it. |
| `list_components` | Browse all components, blocks, or named examples. Params: `limit`, `offset`, `type` (`ui \| block \| example`), `category`. |
| `search_components` | Fuzzy search by name, description, keywords, or category. Use when the exact name isn't known. Params: `query`, `limit`, `type`, `category`. |
| `view_component` | Get full source, dependencies, and registry deps for one or more components. |
| `get_examples` | Fetch live demo files (TSX source) for a component or block. Use to see real-world usage. |
| `get_add_command` | Generate the `npx shadcn@latest add` command for one or more components. |
| `get_theme_info` | Theme configuration: CSS setup, OKLCH semantic tokens, radius scale, dark mode, custom tokens. |
| `audit_checklist` | Post-install checklist verifying CSS setup, Tailwind config, dependencies, imports, and common issues. |

## Recommended workflow

1. **Orient** — `get_project_context` to learn how this project consumes Keystone. Everything you write depends on `installMode`.
2. **Discover** — `list_components` (broad) or `search_components` (targeted) to find the right component.
3. **Inspect** — `view_component({ names: [...] })` to read source and understand the API. Up to 5 names per call.
4. **See real usage** — `get_examples({ name })` to fetch demo TSX files. Especially useful for blocks (`signin-01`, `tickets-01`) and complex components.
5. **Install** — `get_add_command({ names: [...] })` to get the install command. Run it.
6. **Verify** — `audit_checklist` after first install to confirm CSS, Tailwind, and theme tokens are wired correctly.

## When to use MCP vs the CLI

- **MCP tools** are best when you're working through an MCP-aware client (Claude Code, Cursor, VS Code Copilot, OpenCode, Codex).
- **The `keystoneui` CLI** covers the same surface as verbs, for shells, CI, and hosts without MCP — `npx -y @keystoneui/mcp@latest <verb>`. See [cli.md](./cli.md).

Both reach the same registry; pick whichever fits the host.

## Examples

```
# Learn how this project consumes Keystone
get_project_context()

# Find a component
search_components({ query: "date picker", limit: 5 })

# Read the source
view_component({ names: ["calendar", "date-input"] })

# Fetch demo TSX (single component)
get_examples({ name: "calendar" })

# Fetch all files of a complex block
get_examples({ name: "tickets-01" })

# Get the install command
get_add_command({ names: ["calendar", "date-input"] })

# Browse blocks (page-level compositions)
list_components({ type: "block", limit: 20 })
```
