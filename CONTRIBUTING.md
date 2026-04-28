# Contributing to Keystone UI

This guide covers the end-to-end workflow for adding and maintaining components in Keystone UI.

## Quick Reference

| What | Where |
|------|-------|
| Component source | `packages/ui/src/{name}.tsx` |
| Package exports | `packages/ui/package.json` |
| Build entry points | `packages/ui/tsup.config.ts` |
| Registry metadata | `packages/ui/src/_registry.ts` |
| Storybook stories | `apps/storybook/stories/{name}.stories.tsx` |
| Fumadocs demos | `apps/docs/demos/{name}/` |
| Demo registry | `apps/docs/demos/index.ts` |
| MDX documentation | `apps/docs/content/docs/components/{name}.mdx` |
| Component navigation | `apps/docs/content/docs/components/meta.json` |

## Adding a New Component

### 1. Scaffold

Run the scaffolding command from the workspace root:

```bash
pnpm add:component MyComponent
```

This creates all files and updates all registries automatically:

- `packages/ui/src/my-component.tsx` — component template
- `packages/ui/package.json` — subpath export
- `packages/ui/tsup.config.ts` — build entry
- `packages/ui/src/_registry.ts` — shadcn registry entry
- `apps/storybook/stories/my-component.stories.tsx` — story template
- `apps/docs/demos/my-component/default.tsx` — default demo
- `apps/docs/demos/index.ts` — demo registry entry
- `apps/docs/content/docs/components/my-component.mdx` — documentation page
- `apps/docs/content/docs/components/meta.json` — navigation entry

### 2. Implement the component

Edit `packages/ui/src/my-component.tsx`. Follow the conventions in `.cursor/rules/component-architecture.mdc` and `.cursor/rules/design-tokens.mdc`.

Key rules:
- Single-file component (types, contexts, sub-components all in one file)
- Use `@base-ui/react` for primitives (never Radix UI)
- Use `class-variance-authority` for variants
- Add `data-slot` to every exported component part
- Use React 19 ref props (no `forwardRef`)

### 3. Write Storybook stories (primary development surface)

Edit `apps/storybook/stories/my-component.stories.tsx`. This is where you develop and iterate on the component visually.

Write comprehensive stories covering:
- All variants and sizes
- Interactive states (hover, focus, disabled, loading)
- Composition patterns
- Edge cases

Run Storybook: `pnpm dev --filter=@keystoneui/storybook`

### 4. Create Fumadocs demos

Create simplified demos in `apps/docs/demos/my-component/`. Not every Storybook story needs a demo — focus on the 3-6 most useful examples.

Each demo file must:
- Start with `"use client";`
- Import from `@keystoneui/react/my-component`
- Export a single default function

Example:

```tsx
"use client";

import { MyComponent } from "@keystoneui/react/my-component";

export default function MyComponentDefault() {
  return <MyComponent>Hello</MyComponent>;
}
```

### 5. Register demos

Add each demo to `apps/docs/demos/index.ts`:

```ts
import MyComponentDefault from "./my-component/default";
import MyComponentVariants from "./my-component/variants";

// In the demos record:
"my-component-default": { component: MyComponentDefault, file: "my-component/default.tsx" },
"my-component-variants": { component: MyComponentVariants, file: "my-component/variants.tsx" },
```

### 6. Write MDX documentation

Edit `apps/docs/content/docs/components/my-component.mdx`:

```mdx
---
title: MyComponent
description: A brief description of the component.
---

## Import

\`\`\`tsx
import { MyComponent } from "@keystoneui/react/my-component";
\`\`\`

## Usage

<ComponentPreview name="my-component-default" />

## Composition

\`\`\`text
MyComponent
├── MyComponentHeader
└── MyComponentContent
\`\`\`

## Variants

<ComponentPreview name="my-component-variants" />

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"default" \| "outline"` | `"default"` | Visual variant |
```

### 7. LLMs.txt (automatic)

No manual step. The LLMs.txt pipeline reads MDX pages and replaces `<ComponentPreview>` tags with actual demo source code. After deployment, the endpoints at `/llms.txt`, `/llms-full.txt`, `/llms-components.txt`, and `/docs/components/my-component.mdx` are updated automatically.

## Updating an Existing Component

### When to update Fumadocs

| Change type | Storybook | Demos | MDX |
|-------------|-----------|-------|-----|
| **New prop or variant** | Add/update story | Add demo if user-facing | Update API Reference table |
| **Prop renamed or removed** | Update stories | Update affected demos | Update API Reference table |
| **New sub-component** | Add stories | Add demo if useful | Add to Import section AND update Composition tree |
| **Visual/styling change** | Auto-reflects | Auto-reflects | No change needed |
| **Bug fix** | Add regression story | No change needed | No change needed |
| **Description change** | N/A | N/A | Update MDX frontmatter |

### Checklist for API changes

1. Update the component source in `packages/ui/src/{name}.tsx`
2. Update or add Storybook stories
3. If the change is user-facing:
   - Update relevant demos in `apps/docs/demos/{name}/`
   - Add new demos for new features
   - Update the MDX API Reference table
4. If dependencies changed, update `packages/ui/src/_registry.ts`

### Checklist for new sub-components

1. Update the component source
2. Add Storybook stories for the new sub-component
3. Create a demo showing the sub-component in use
4. Register the demo in `apps/docs/demos/index.ts`
5. Update the MDX Import section and add a `<ComponentPreview>` for the new demo
6. Update the `## Composition` ASCII tree in the MDX so agents see the new nesting

### Composition section (compound components)

For compound components (≥2 exported parts that nest), include a `## Composition` section after `## Usage` with an ASCII tree of the parts. The tree mirrors what shadcn/ui ships and helps both human readers and LLMs see required nesting at a glance — the section flows through `llms-full.txt` automatically. Use box-drawing characters (`├──`, `└──`, `│`) and indent two spaces per level. Skip for single-piece components (Button, Badge, Input, Spinner, etc.).

## Development Commands

```bash
pnpm dev --filter=@keystoneui/storybook    # Storybook dev server (port 6006)
pnpm dev --filter=@keystoneui/docs          # Fumadocs dev server (port 3000)
pnpm build --filter=@keystoneui/docs        # Build docs (verifies types + LLMs.txt)
pnpm add:component <Name>       # Scaffold a new component
```

## Release Workflow

The library uses [Changesets](https://github.com/changesets/changesets) in **pre-release mode** to publish beta versions to npm. The package is published as `@keystoneui/react` and consumers install with `pnpm add @keystoneui/react@beta`. Inside Claude Code, the `/release` skill wraps the entire local-side flow (bump → sync → commit → push).

### Two changelogs, one source of truth

Two changelogs are surfaced to consumers, and both flow from `.changeset/*.md`:

| Surface | Path | Generated by | Hand-edit? |
|---------|------|--------------|------------|
| npm changelog | `packages/ui/CHANGELOG.md` | `changeset version` | No — derived from `.changeset/*.md` |
| Docs site changelog | `apps/docs/content/changelog/<date>-v<ver>.mdx` (released) and `unreleased.mdx` (queued) | `scripts/sync-unreleased.mjs` | Optional — auto-generated, polish post-rotation if you want richer formatting |

`unreleased.mdx` is **automatically regenerated** from the unconsumed `.changeset/*.md` files by:
1. The `pre-commit` hook — every time you commit a new or modified `.changeset/*.md`, the hook runs `pnpm sync-unreleased` and stages the result.
2. `pnpm version-packages` — runs sync first so the dated mdx (after rotation) inherits real auto-derived content.

If you want to hand-curate the Unreleased section for a specific release (e.g. add `<ChangeTag>` / `<ComponentPreview>` decoration), stage your `unreleased.mdx` edit alongside the changeset — the pre-commit hook detects this and skips the auto-sync to preserve your edit.

To regenerate manually: `pnpm sync-unreleased`.

### How it works

```mermaid
flowchart TD
    A[Write code and commit] --> B{Affects what<br/>npm consumers get?}
    B -->|No: stories, CI, tests, dev tooling| C[Push to main]
    B -->|Yes: component changes,<br/>new features, bug fixes| D[pnpm changeset<br/>interactive]
    D --> E[Commit the .changeset/*.md]
    E --> F[Pre-commit hook<br/>auto-syncs unreleased.mdx]
    F --> C
    C --> G{Time to release?}
    G -->|Not yet| H[Keep merging changes;<br/>Unreleased page<br/>stays in sync]
    G -->|Yes| I[Run /release<br/>= pnpm version-packages<br/>+ commit + push]
    I --> J[CI publishes to npm<br/>@beta tag]
    H --> A
```

### When you need a changeset

Create a changeset for any change that affects what consumers of `@keystoneui/react` (or `@keystoneui/mcp`) receive:

- New component or MCP tool
- Bug fix in a component
- Changed API, props, or behavior
- Styling changes that affect consumers
- Updated dependencies in `packages/ui/package.json` or `packages/keystoneui-mcp/package.json`

### When you do NOT need a changeset

Skip the changeset for anything internal to the repo:

- Storybook stories
- CI workflow changes
- Documentation (docs app, README)
- Test additions or fixes
- Dev tooling changes

Commits without a changeset push to GitHub but do not trigger an npm publish. The `@beta` tag on npm stays at the previous version until you explicitly release.

### Day-to-day flow

```bash
# 1. Make a change, commit it
git add packages/ui/src/foo.tsx
git commit -m "fix(ui): correct foo focus ring"

# 2. Add a changeset (interactive: pick package, bump type, summary)
pnpm changeset

# 3. Commit the changeset — pre-commit hook auto-syncs unreleased.mdx
git add .changeset/
git commit -m "chore: changeset for foo fix"

# 4. Push when ready
git push origin main
```

You can batch many of these. The Unreleased docs section accumulates queued work as you commit changesets — by release time, it already shows what's coming.

### Releasing

When the queued work is ready to ship, invoke `/release` (in Claude Code) or run the equivalent commands:

```bash
# 1. Bump (wraps sync-unreleased + changeset version + rotate-changelog)
pnpm version-packages

# 2. Sanity-build the docs (Zod-validates the new mdx frontmatter)
pnpm build --filter=@keystoneui/docs

# 3. Stage the version-bump artifacts only
git add \
  packages/ui/package.json \
  packages/ui/CHANGELOG.md \
  packages/keystoneui-mcp/package.json \
  packages/keystoneui-mcp/CHANGELOG.md \
  apps/docs/content/changelog/ \
  .changeset/pre.json

# 4. Commit and push
git commit -m "chore: version packages"
git push origin main
```

CI runs `.github/workflows/release.yml` on push to `main`, which invokes `changesets/action@v1` with `publish: pnpm release`. Versions that don't yet exist on npm are published with the `beta` dist-tag, then a GitHub Release is auto-created per package using the matching `CHANGELOG.md` section as the body. Idempotent — re-running on a no-op push does nothing.

### Version progression

In pre-release mode, each publish increments the beta counter regardless of declared bump type:

| Cycle | Version |
|-------|---------|
| Initial | `0.1.0-beta.0` |
| After 1st bump | `0.1.0-beta.1` |
| After 2nd bump | `0.1.0-beta.2` |
| Major-bump changeset | resets to `1.0.0-beta.N` |

The bump type (patch, minor, major) is remembered by changesets and applied when you exit beta.

### Exiting beta (stable release)

When the library is ready for a stable release:

```bash
pnpm changeset pre exit     # exit pre-release mode
pnpm changeset              # create a changeset for the stable release
pnpm version-packages       # bumps to stable version (e.g. 1.0.0)
git add . && git commit -m "chore: release stable version"
git push origin main        # publishes to @latest tag
```

After this, `pnpm add @keystoneui/react` (without `@beta`) installs the stable version.

## LLMs.txt Endpoints

These are generated automatically from MDX + demo files:

| URL | Description |
|-----|-------------|
| `/llms.txt` | Index of all documentation pages |
| `/llms-full.txt` | Complete documentation content |
| `/llms-components.txt` | Component documentation only |
| `/docs/components/{name}.mdx` | Individual component page |

The pipeline replaces `<ComponentPreview name="X" />` tags with actual demo source code from disk, so AI agents receive real, executable code examples.
