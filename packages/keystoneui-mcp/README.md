# @keystoneui/mcp

MCP server and CLI for [Keystone UI](https://keystoneui.io) — lets AI agents and shell users discover, search, view, and install components, blocks, and named examples from the Keystone UI registry.

The single binary runs in two modes:

- **No args** → Model Context Protocol stdio server (for Claude Code, Cursor, VS Code Copilot, OpenCode, Codex)
- **With a verb** → CLI for shells, CI, and non-MCP environments

## Quick start

### As an MCP server

```bash
npx -y @keystoneui/mcp init --client claude
```

Supported clients: `claude`, `cursor`, `vscode`, `opencode`, `codex`. The `init` command writes the appropriate config file for the chosen client and points it at `npx @keystoneui/mcp@latest`.

Once configured, ask your agent things like:

- *"List Keystone UI components."*
- *"How do I add a Keystone UI Table with pagination?"*
- *"Build a sign-in page using Keystone UI."*

### As a CLI

```bash
# Discover
npx keystoneui search "table pagination"
npx keystoneui list --type example
npx keystoneui blocks signin

# Inspect
npx keystoneui view button
npx keystoneui docs button             # /llms.mdx/docs/components/button
npx keystoneui examples table          # all demo files for the table component

# Install (delegates to shadcn CLI)
npx shadcn@latest add https://keystoneui.io/r/table-with-pagination.json

# Verify
npx keystoneui audit
```

## Verbs

| Verb | Purpose |
|---|---|
| `init [--client <name>]` | Configure MCP client |
| `search <query> [--type T] [--limit N]` | Fuzzy search components, blocks, named examples |
| `list [--type T] [--limit N] [--offset N]` | List items (`T` = `ui` \| `block` \| `example`) |
| `view <name> [<name>...]` | Show component source |
| `examples <name>` | All demo files for a component or block |
| `docs <name>` | Fetch the LLM-resolved MDX page (`/llms.mdx/docs/components/<name>`) |
| `audit` | Print the post-install checklist |
| `blocks [<filter>]` | List or filter full-page blocks |

Run `keystoneui help` for the full list. Without any verb the binary launches the MCP stdio server.

## MCP tools

When run without arguments the server exposes seven tools to MCP clients:

- `list_components` — list components, blocks, or examples with pagination
- `search_components` — fuzzy search across components, blocks, and examples
- `view_component` — full source for one or more components
- `get_add_command` — generate the shadcn CLI command for installing components
- `get_examples` — fetch live demo files for a component or block
- `get_theme_info` — semantic color tokens, radius scale, dark-mode setup
- `audit_checklist` — post-install verification checklist

## Configuration

The server reads the registry URL in this order:

1. `KEYSTONEUI_REGISTRY_URL` env var
2. `registries["@keystoneui"].url` from a local `components.json`
3. Default: `https://keystoneui.io/r`

## License

MIT
