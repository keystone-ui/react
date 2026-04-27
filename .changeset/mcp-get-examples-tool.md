---
"@keystoneui/mcp": minor
---

Add `get_examples` MCP tool for fetching demo TSX files.

Agents can now call `get_examples({ name: "button" })` (or any block name like `"signin-01"`, `"tickets-01"`) to pull the live demo source. Mirrors shadcn's `get_item_examples_from_registries`. Backed by a new `/r/demos/[name]` route on the docs site that reads `apps/docs/demos/{name}/`, falls back to `apps/docs/demos/blocks/{name}/`, then to single-file blocks at `apps/docs/demos/blocks/{name}.tsx`.

Brings the MCP server to 7 tools.
