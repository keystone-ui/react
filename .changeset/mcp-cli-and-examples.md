---
"@keystoneui/mcp": minor
---

Make `@keystoneui/mcp` publishable, add a CLI mode, surface named examples and blocks, and add a `blocks` verb.

- **Publishable.** Removed `private: true` and added a `prepublishOnly` build hook. The `npx -y @keystoneui/mcp init --client <name>` command now works for downstream users.
- **CLI mode.** The single binary runs in two modes — no args launches the MCP stdio server (existing behavior), with a verb dispatches to the CLI. Verbs: `init`, `search`, `list`, `view`, `examples`, `docs`, `audit`, `blocks`. New `keystoneui` bin alias alongside `keystoneui-mcp`.
- **Named examples.** `list_components` and `search_components` now accept `type: "example"`. Named demos (e.g. `table-with-pagination`, `card-with-image`) are addressable in MCP search and at `https://keystoneui.io/r/<name>.json` for direct shadcn-CLI install. Tool descriptions updated to advertise this.
- **Blocks verb + categories.** `keystoneui blocks` lists full-page blocks; `keystoneui blocks <filter>` either views a single block or fuzzy-searches type=block. Block items now carry `categories` (e.g. `["authentication", "login"]`, `["betting"]`, `["data"]`) — both `list` and `search` accept `--category C` to filter, and category strings participate in fuzzy match. Mirrors shadcn's block taxonomy.
- **`docs` verb.** Fetches the LLM-resolved MDX page at `/llms.mdx/docs/components/<name>` (preview tags inlined as TSX).
