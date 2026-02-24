# Keystone UI

A modern React component library built with [Base UI](https://base-ui.com), [Tailwind CSS v4](https://tailwindcss.com), and [class-variance-authority](https://cva.style). Ships as individually importable, tree-shakeable ESM components.

## Packages

| Package | Description |
| --- | --- |
| [`@keystoneui/react`](packages/ui) | Core component library — 50+ accessible, themeable components |
| [`docs`](apps/docs) | Documentation site built with Fumadocs (Next.js) |
| [`storybook`](apps/storybook) | Component development and visual testing with Storybook |

For full documentation, visit [keystoneui.io](https://keystoneui.io).

## Quick Start

```bash
pnpm install
pnpm dev          # Storybook (6006) + Fumadocs (3000) + UI watch-build
pnpm build        # Build all packages and apps via Turborepo
```

## Tech Stack

- **React** v19+ with subpath exports (`@keystoneui/react/button`)
- **Tailwind CSS** v4.1 with OKLCH semantic tokens
- **Base UI** (`@base-ui/react` v1.2) for accessible primitives
- **CVA** + `clsx` + `tailwind-merge` for variant management
- **TypeScript** v5.9 with strict mode
- **tsup** (esbuild) — ESM-only output
- **Storybook** v10.2 — component development and documentation
- **Fumadocs** — docs site with live demos and LLMs.txt endpoints
- **Biome** (via `ultracite`) — formatting and linting
- **Changesets** — versioning and npm publishing
- **Turborepo** — monorepo orchestration with cached builds

## Monorepo Structure

```
├── apps/
│   ├── storybook/          # Storybook documentation app
│   └── docs/               # Fumadocs site (Next.js)
├── packages/
│   ├── ui/                 # @keystoneui/react — component library
│   │   └── src/            # One .tsx file per component (flat)
│   └── typescript-config/  # Shared tsconfig
├── scripts/
│   └── add-component.mjs   # Component scaffolding
├── turbo.json
└── pnpm-workspace.yaml
```

## Usage

Install the package:

```bash
pnpm add @keystoneui/react
```

Import individual components:

```tsx
import { Button } from "@keystoneui/react/button";
import { Card, CardContent } from "@keystoneui/react/card";
```

You must also import the base CSS in your app's root stylesheet:

```css
@import "@keystoneui/react/base.css";
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full component workflow — scaffolding, Storybook stories, Fumadocs demos, and MDX documentation.

### Key Commands

```bash
pnpm dev                        # Storybook (6006) + Fumadocs (3000) + UI watch-build
pnpm build                      # Build all packages and apps
pnpm check                      # Biome lint/format check
pnpm fix                        # Auto-fix Biome issues
pnpm test --filter=@keystoneui/react  # Run component tests
pnpm add:component MyComponent  # Scaffold a new component
```

## Versioning

This project uses [Changesets](https://github.com/changesets/changesets) for version management. To propose a version bump:

```bash
pnpm changeset
```

When changes are merged to `main`, a GitHub Action creates a release PR or publishes to npm automatically.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and [AGENTS.md](AGENTS.md) for AI agent guidance.
