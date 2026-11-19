# @keystoneui/mcp

## 0.2.0-beta.6

### Minor Changes

- cf1970e: Describe kits and package flavours, with explicit item-name rules
  
  The MCP server and CLI read `meta.keystoneui` on registry items. List and search append metadata to each entry. A parent can show `Package flavour:` for a flavour declared elsewhere in the index. View places the fetched item’s own metadata between its summary and source. Existing filters use the same result order, totals and paging. Registries can omit the metadata. The new list and search `type` values are `kit`, `style`, `theme` and `item`. `kit` selects `registry:component`.
  
  `get_add_command` generates shadcn commands. The default and `flavour: "vendored"` use the supplied names without a per-call project or network lookup. `flavour: "package"` gives the registry-index lookup ten seconds. On success it reads the project, selects advertised package flavours and prints any declared version minimum alongside the project declaration. UI items without a selected flavour get conditional package-import advice. Blocks, kits and examples without a package flavour keep their vendored targets. If the index lookup fails, the tool uses the supplied names. Package-mode `get_project_context` adds a line about this option.
  
  - Names with empty segments, `.` or `..` segments (including mixed-case `%2e` forms), `?`, `#`, backslashes, C0 controls or DEL are refused. An empty name and a final segment that becomes empty, `.` or `..` after trailing ASCII spaces are removed are also refused. Accepted names still include nested paths, spaces and shell metacharacters.
  - `view_component` returns a refusal in the affected slot. `get_docs` and `get_examples` return it directly. CLI `view`, `docs` and `examples` put refusals on stderr and exit 1. A mixed CLI view keeps valid results on stdout. `get_add_command` refuses the whole call for invalid input before any lookup, and also refuses an invalid flavour selected from the index. A caller-supplied `?only=` without C0 controls or DEL gets instructions to append the parameter to the printed URL.
  - `get_add_command` quotes each complete install URL as one shell word when it contains characters outside `A-Z a-z 0-9 @ % + = : , . _ / -`. If any target URL contains a line break or control character, guidance replaces the commands. This includes C1 controls and U+2028/U+2029, which the name validator accepts. Concrete install URLs in `get_theme_info` and CLI `theme` also use shell quoting, including queries such as `?only=font`.
  - `get_docs` and CLI `docs` resolve an initial 404 through an item’s docs pointer, its flavour parent’s pointer or its valid block/UI parent’s own page. A successful fallback returns the full page and identifies the optional section. CLI `docs` exits 0 on that success and accepts `--type component|block`. On a demos 404, `get_examples` can suggest a containing block or flavour parent from the index.
  - `keystoneui blocks <name>` extends its existing hyphenated-name shortcut to a single exact block name found in the index. This adds direct viewing for `npm/users-01` in the first-party registry.
  - Prose escapes line breaks, controls and leading fence markers. Inline-code delimiters are longer than any embedded backtick run. Project-table cells escape pipes, including those in package version ranges. Message escaping preserves the kind, code and cause of the error it receives after URL redaction.
  - Source in `view_component` and `get_examples` uses a fence longer than any backtick run in the body. A demo file’s extension is escaped on the fence line. The `table` source and `filter-trigger.tsx` in `admin-01`, `users-01`, `filter-pills`, `npm/users-01` and `npm/filter-pills` use four-backtick fences. `view_component` adds a separator before the closing fence if source lacks a final line break. The first-party registry sources already have a final line break.
  - `get_theme_info` identifies the sidebar item that reads the sidebar tokens. The tool descriptions and server instructions describe kits and package-flavour selection.

### Patch Changes

- 3e5698f: Compose registry URLs correctly when they have a query, a fragment, a trailing slash or a `{name}` template
  
  A registry URL set through `KEYSTONEUI_REGISTRY_URL` or a `components.json` `@keystoneui` `{ "url": … }` object is now composed with the path before its query: `https://host/r?v=1` requests `https://host/r/registry.json?v=1` instead of `https://host/r?v=1/registry.json`. A fragment is dropped instead of the path, and a trailing slash no longer doubles (`https://host/r/` requests `https://host/r/button.json`). An `@keystoneui` object whose `url` is a `{name}` template (`https://host/r/{name}.json`) has the item name put into it, with its `params` appended after the template's own query; its catalogue and demos are read from beside the item file when the template ends in `/{name}.json`. `get_add_command`, `get_theme_info` and the catalogue link in `keystoneui info` print the same composed URLs. The default registry and plain base URLs are requested and printed exactly as before, and headers in a `components.json` entry are still not sent.

## 0.2.0-beta.5

### Patch Changes

- 8a969f9: `init` points to the docs on projects you do not trust
  
  After writing a client configuration, or printing the Codex entry, `init` prints one line linking to the docs section to read before using the server in a project you have not reviewed. The usage text now names `@keystoneui/mcp@latest`; what `init` writes is unchanged.
- f6cba6f: Stop printing credentials from configured URLs in errors and `info`
  
  Error messages, `get_docs`'s unreachable message and `keystoneui info` (text and `--json`) no longer echo the username, password, query values or fragment of a registry or docs URL set through `KEYSTONEUI_URL`, `KEYSTONEUI_REGISTRY_URL` or `components.json`. A URL that is not `http`, `https` or `file` (such as `user:secret@host`, missing its scheme) is shown as a placeholder. The URL actually fetched is unchanged.
  
  Install commands and theme links are printed as configured.

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
