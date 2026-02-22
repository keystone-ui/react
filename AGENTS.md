# AGENTS.md

This file provides guidance to AI coding agents working with this repository.

## Repository Overview

Keystone UI is a React component library built as a pnpm monorepo managed by Turborepo.

### Key Technical Stack

- **Node.js**: v22+
- **pnpm**: v9.15.0
- **React**: v19+
- **Tailwind CSS**: v4.1
- **Base UI**: `@base-ui/react` v1.2 (primitive library — NOT Radix UI)
- **CVA**: `class-variance-authority` for variant management
- **TypeScript**: v5.9
- **Storybook**: v10.2 (documentation and component development)
- **Biome**: Code formatting and linting (via `ultracite`)
- **Changesets**: Version management

## Development Commands

### Core Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start Storybook dev server (port 6006)
pnpm build            # Build all packages (via Turborepo)
pnpm check            # Run Biome linting/formatting checks
pnpm fix              # Auto-fix Biome issues
pnpm clean            # Remove build artifacts and node_modules
```

### Testing

```bash
pnpm test --filter=@keystoneui/react    # Run component unit tests (Vitest)
pnpm test --filter=storybook       # Run Storybook interaction tests
```

### Release & Versioning

```bash
pnpm changeset           # Create a changeset for versioning
pnpm version-packages    # Apply changesets to bump versions
pnpm release             # Build and publish packages
pnpm preview-storybook   # Preview built Storybook
```

### Package-Specific Commands

Use `--filter` with the package name to target a specific workspace:

```bash
pnpm build --filter=@keystoneui/react      # Build only the UI package
pnpm build --filter=storybook         # Build only the Storybook docs
pnpm dev --filter=@keystoneui/react        # Watch-build the UI package
```

Main packages: `@keystoneui/react`, `storybook`, `docs`

## Monorepo Structure

```
├── apps/
│   ├── storybook/               # Storybook documentation app
│   │   └── stories/             # Story files (one per component)
│   └── docs/                    # Fumadocs documentation site
│       ├── demos/               # Live demo files (one dir per component)
│       ├── content/docs/        # MDX documentation pages
│       └── app/                 # Next.js routes + LLMs.txt endpoints
├── packages/
│   ├── ui/                      # @keystoneui/react — main component library
│   │   └── src/                 # Flat directory: one .tsx file per component
│   │       └── base.css         # Required component CSS (animations, transitions, hover gating)
│   │   └── registry/            # shadcn registry items (style + theme JSONs)
│   └── typescript-config/       # Shared TypeScript config
├── scripts/
│   └── add-component.mjs        # Component scaffolding script
├── turbo.json
└── pnpm-workspace.yaml
```

## Component Architecture (Summary)

For full conventions, see `.cursor/rules/component-architecture.mdc`.

- **Flat single-file components**: Every component is one `.tsx` file in `packages/ui/src/` — no nested folders, no barrel files
- **Base UI primitives**: Use `@base-ui/react`, never `@radix-ui`
- **CVA variants**: Styling via `class-variance-authority` + `clsx` + `tailwind-merge`
- **Subpath exports**: Consumers import via `@keystoneui/react/button`, not `@keystoneui/react`
- **`data-slot` attributes**: Every exported component part gets a `data-slot` for stable targeting
- **Named exports**: Compound component parts exported individually at the bottom of the file
- **Internal imports**: Relative sibling imports only (`./utils`, `./button`) — no barrel imports

## Styling Conventions (Summary)

For full conventions, see `.cursor/rules/design-tokens.mdc`.

- **Tailwind CSS v4** with OKLCH color space
- **Semantic tokens**: `primary`, `secondary`, `destructive`, `muted`, `accent`, `card`, `popover`
- **Hover gating**: `base.css` overrides `hover:` variant with `@media (hover: hover)` — never embed `:hover` in arbitrary selectors
- **Focus styles**: Two patterns — outline-based (buttons, checkboxes) and ring-based (inputs, selects). Never mix.
- **Disabled states**: Both `disabled:` (native HTML) and `data-disabled:` (Base UI) — always include `cursor-not-allowed` and `opacity-50`

## Icon Library

Use `lucide-react` for all icons. Do not use `@iconify/react`, `@remixicon/react` in component source, or other icon libraries.

Note: `@remixicon/react` appears in some story files for social/brand icons — this is acceptable for stories only, not component source.

## Git Commit Convention

All commits must follow Conventional Commits:

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Example: `feat(ui): add tag-group component`

## Adding a New Component

Run the scaffolding command:

```bash
pnpm add:component MyComponent
```

This creates all files (component, story, demo, MDX page) and updates all registries. Then follow the **Storybook-first** workflow:

1. Implement the component in `packages/ui/src/`
2. Write Storybook stories (primary development surface)
3. Create simplified Fumadocs demos (3-6 per component)
4. Register demos in `apps/docs/demos/index.ts`
5. Write MDX documentation with `<ComponentPreview>` tags
6. LLMs.txt endpoints update automatically (no manual step)

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow, including when to update Fumadocs after component changes.

## Documentation & LLMs.txt

The docs site (Fumadocs) serves both interactive documentation and LLMs.txt endpoints:

- **Demo files** in `apps/docs/demos/` render as live previews on the docs site AND get injected as code blocks in LLMs.txt output
- **MDX files** in `apps/docs/content/docs/components/` use `<ComponentPreview name="X" />` tags to reference demos
- **LLMs.txt routes**: `/llms.txt`, `/llms-full.txt`, `/llms-components.txt`, `/docs/components/{name}.mdx`

## Important Constraints

- **No Radix UI** — use `@base-ui/react` for all primitives
- **No barrel files** — each component file is its own entry point
- **No `transition-all`** — always specify exact transition properties (exception: Button, which uses `active:scale-[0.98]`)
- **No raw color values** in component base styles — always use semantic tokens (exception: Badge color variants)
- **Explicit `cursor-pointer`** on all interactive elements — Tailwind v4 changed the default
- **Update `_registry.ts`**, `package.json` exports, and `tsup.config.ts` entryPoints when adding new components
