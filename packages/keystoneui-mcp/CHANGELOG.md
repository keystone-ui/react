# @keystoneui/mcp

## 0.2.0-beta.1

### Minor Changes

- c9bf635: Make `@keystoneui/mcp` publishable, add a CLI mode, surface named examples and blocks, and add a `blocks` verb.
  - **Publishable.** Removed `private: true` and added a `prepublishOnly` build hook. The `npx -y @keystoneui/mcp init --client <name>` command now works for downstream users.
  - **CLI mode.** The single binary runs in two modes — no args launches the MCP stdio server (existing behavior), with a verb dispatches to the CLI. Verbs: `init`, `search`, `list`, `view`, `examples`, `docs`, `audit`, `blocks`. New `keystoneui` bin alias alongside `keystoneui-mcp`.
  - **Named examples.** `list_components` and `search_components` now accept `type: "example"`. Named demos (e.g. `table-with-pagination`, `card-with-image`) are addressable in MCP search and at `https://keystoneui.io/r/<name>.json` for direct shadcn-CLI install. Tool descriptions updated to advertise this.
  - **Blocks verb + categories.** `keystoneui blocks` lists full-page blocks; `keystoneui blocks <filter>` either views a single block or fuzzy-searches type=block. Block items now carry `categories` (e.g. `["authentication", "login"]`, `["betting"]`, `["data"]`) — both `list` and `search` accept `--category C` to filter, and category strings participate in fuzzy match. Mirrors shadcn's block taxonomy.
  - **`docs` verb.** Fetches the LLM-resolved MDX page at `/llms.mdx/docs/components/<name>` (preview tags inlined as TSX).

## 0.2.0-beta.0

### Minor Changes

- ff44707: Add `get_examples` MCP tool for fetching demo TSX files.

  Agents can now call `get_examples({ name: "button" })` (or any block name like `"signin-01"`, `"tickets-01"`) to pull the live demo source. Mirrors shadcn's `get_item_examples_from_registries`. Backed by a new `/r/demos/[name]` route on the docs site that reads `apps/docs/demos/{name}/`, falls back to `apps/docs/demos/blocks/{name}/`, then to single-file blocks at `apps/docs/demos/blocks/{name}.tsx`.

  Brings the MCP server to 7 tools.

### Patch Changes

- 11dc9b5: Upgrade dependencies to latest stable + modernize React 19 patterns.

  **Public API change (minor):** primitives no longer use `React.forwardRef` —
  `ref` is now a regular prop in keeping with React 19. Consumers that read
  the component prop type via `React.ComponentProps<typeof Foo>` will see
  `ref` as a regular prop (typed as `React.RefAttributes<T>`). Most callers
  need no change.

  **Headline upstream bumps:**
  - `@base-ui/react` 1.2 → 1.4 (Drawer is stable; new optional Label/InputGroup
    parts on Combobox/Select/Slider/Autocomplete; many bug fixes)
  - `lucide-react` 0.575 → 1.11 (`*Icon` suffix dropped from default exports;
    imports rewritten as aliases throughout the codebase; brand icons removed,
    `Github` replaced with `Code` in the docs home)
  - `shadcn` CLI 3 → 4, `vite` 7 → 8, `typescript` 5.9 → 6, `next` 16.1 → 16.2,
    `motion` 12.34 → 12.38, `react-day-picker` 9.13 → 9.14,
    `react-resizable-panels` 4.6 → 4.10, `react-aria-components` 1.15 → 1.17,
    `chromatic` 15 → 16, `vitest` 4.0 → 4.1, `storybook` 10.2 → 10.3,
    `jsdom` 28 → 29, `zod` 3 → 4 (mcp), Tailwind 4.2.0 → 4.2.4, biome 2.4.4 →
    2.4.13, ultracite 7.2 → 7.6.

  **Tooling note:** TS 6 deprecates `baseUrl`. The shared `typescript-config`
  sets `ignoreDeprecations: "6.0"` to silence the warning while keeping
  `apps/docs`'s path-alias setup working. Revisit when TS 7 lands.
