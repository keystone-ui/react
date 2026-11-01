# @keystoneui/mcp

## 0.2.0-beta.4

### Minor Changes

- 8ca181a: Add `keystoneui audit --theme [css] [--strict]`: measure your own theme's contrast the way keystone measures its defaults.
  
  It reads the top-level `:root` and `.dark` blocks of your CSS (the file `components.json` names, or a path you pass), skips `@media print` ink tokens, and reports eleven text-on-surface pairs — foreground, card, popover, primary, secondary, muted, accent, destructive, success, warning, info — against WCAG AA in both modes. `--strict` exits 1 on a failure, for CI. Values that need a browser to resolve (`var()`, `color-mix()`, alpha) are reported as skipped, never guessed. No new dependency: OKLCH converts straight to linear sRGB.
- a2e6e76: Add `keystoneui theme <code> [--only theme,font]`.
  
  The theme builder now encodes a theme as a short code (`k1_<base>_<L>_<C>_<H>_<radius>_<font>`), and keystoneui.io serves each code as a shadcn `registry:theme` item at `/r/theme/<code>.json`. The verb prints the decoded settings, the `shadcn add` command (optionally partial: only the colours and radius, or only the font), and a link back into the builder. `get_theme_info` documents the same flow for agents.

### Patch Changes

- c8c6e1a: `get_docs` now tells agents to read a component's `## Composition` tree before composing it. The tree is the parts hierarchy, and its "Invalid nesting" notes list the placements Base UI throws on, such as `DropdownMenuLabel` outside `DropdownMenuGroup`.

## 0.2.0-beta.3

### Patch Changes

- 36cc83b: Upgrade dependencies to latest.
  
  **Runtime deps of `@keystoneui/react`:** `lucide-react` 1.41 → 1.55,
  `tailwind-merge` 3.6 → 3.7, `react-resizable-panels` 4.12 → 4.14, `motion` 12.43 → 14.1 (no
  public API changes upstream: 13.0 dropped the optional `@emotion/is-prop-valid`
  auto-detection, 14.0 removed internal framer-motion compat shims).
  
  **`@keystoneui/mcp`:** `@modelcontextprotocol/sdk` 1.30 → 1.32 (security fix:
  the SDK's OAuth client could send credentials to an authorization server chosen
  by the MCP server, GHSA fixed in 1.31), `zod` 4.5 → 4.6.
  
  **Tooling / docs:** `next` 16.3 → 16.4 (fixes a critical RCE in `next/og`
  `ImageResponse` and an SSRF in image optimization), `@opennextjs/cloudflare`
  1.20.10, `wrangler` 4.149, `react` 19.3, Tailwind 4.3.3, `storybook` 10.6.1,
  `vite` 8.3, `turbo` 2.11, biome 2.5.15, ultracite 7.12.
  
  **TypeScript 7:** docs, Storybook and the MCP server type-check with TS 7.0
  (Next runs it via `experimental.useTypeScriptCli`). `@keystoneui/react` keeps
  building its `.d.ts` with TS 6 through the `@typescript/typescript6` bridge,
  because tsup needs the TypeScript JS API, which 7.0 doesn't ship. Emitted
  declarations are unchanged. The shared config drops
  `ignoreDeprecations: "6.0"`, and the docs app drops `baseUrl`.

## 0.2.0-beta.2

### Patch Changes

- 0cea6cf: Report the real package version over MCP.

  The server advertised a hardcoded `version: "0.1.0"` in its handshake while the
  package was `0.2.0-beta.1`, so clients logged and displayed the wrong version.
  It now reads the version from `package.json` at runtime.

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
