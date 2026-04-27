---
name: contributing
description: Component workflow for keystoneui — triggered when adding, creating, scaffolding, or modifying components, demos, stories, MDX docs, or any AI-agent surface (SKILL.md, AGENTS.md, llms.txt, MCP registry).
globs:
alwaysApply: false
---
# Component Contributing Workflow

See [CONTRIBUTING.md](/CONTRIBUTING.md) for the full guide.

## Adding a New Component

Always start with the scaffolding command:

```bash
pnpm add:component MyComponent
```

This creates all files and updates all registries. Then follow the Storybook-first workflow:

1. **Implement** the component in `packages/ui/src/{name}.tsx`
2. **Write Storybook stories** in `apps/storybook/stories/{name}.stories.tsx` (primary dev surface)
3. **Create Fumadocs demos** in `apps/docs/demos/{name}/` (3-6 simplified demos from stories)
4. **Register demos** in `apps/docs/demos/index.ts`
5. **Write MDX docs** in `apps/docs/content/docs/components/{name}.mdx` using `<ComponentPreview name="{name}-{example}" />`
6. **LLMs.txt** updates automatically (no manual step)
7. **Sync the AI agent surface** — see [Sync the AI Agent Surface](#sync-the-ai-agent-surface) below

## Updating an Existing Component

### API change (new/renamed prop, new sub-component)

1. Update component source
2. Update Storybook stories
3. Update Fumadocs demos if user-facing
4. Update MDX API Reference table
5. Update `_registry.ts` if dependencies changed
6. Sync the AI agent surface (below) — *if the change affects rules, conventions, or the public API the skill teaches*

### Visual/styling change

1. Update component source only
2. Storybook and Fumadocs demos auto-reflect
3. No agent-surface changes needed unless the styling change introduces a new rule (e.g., new transition, new token)

### Description/copy change

1. Update MDX frontmatter or section text only
2. LLMs.txt auto-reflects on next deploy

## Sync the AI Agent Surface

Three surfaces drift if not maintained explicitly. Run through this checklist after any component add or convention change.

### When adding a brand-new component

| Surface | Action |
|---|---|
| `packages/ui/src/_registry.ts` | Add the component entry (handled by `pnpm add:component`). |
| `packages/ui/package.json` exports | Add `./{name}` subpath. |
| `packages/ui/tsup.config.ts` entryPoints | Add the source path. |
| `skills/keystoneui-react/SKILL.md` | Bump the component count and add a row to the **Component List** table (kebab-case name). |
| `skills/keystoneui-react/SKILL.md` Component Selection table | Add the component to the appropriate row (e.g. "Form layout" / "Overlays" / "Feedback"). |
| `apps/docs/content/docs/(getting-started)/agents/mcp-server.mdx` | Bump the "all 54+ UI components" count if you reference one. |
| `README.md` | Bump the "54+ accessible" count if it appears. |
| `apps/docs/public/r/` | Run `pnpm registry:build` to rebuild registry artifacts. |

### When changing a convention or adding a new rule

| Trigger | Surface to update |
|---|---|
| New CSS token (e.g. another `--z-*`, `--ease-*`) | `AGENTS.md` "Styling Conventions" bullet AND `skills/keystoneui-react/rules/styling.md` AND `.claude/skills/design-tokens/SKILL.md`. All three. |
| New form pattern (e.g. new Field variant) | `skills/keystoneui-react/rules/forms.md` AND any block demos that should reflect it. |
| New compound component pattern (e.g. new `data-slot` use) | `skills/keystoneui-react/rules/composition.md` AND `.claude/skills/component-architecture/SKILL.md`. |
| New popup behavior (height, animation, z-stack) | `skills/keystoneui-react/rules/composition.md` AND `.claude/skills/popup-patterns/SKILL.md`. |
| New install path or CLI flow | `skills/keystoneui-react/cli.md` AND `apps/docs/content/docs/(getting-started)/agents/skills.mdx`. |
| New MCP tool | `packages/keystoneui-mcp/src/{server,tools,fetcher}.ts` AND `skills/keystoneui-react/mcp.md` AND `apps/docs/content/docs/(getting-started)/agents/mcp-server.mdx`. |

### Validation

- `pnpm --filter @keystoneui/mcp build` — confirms MCP changes compile.
- `pnpm --filter docs build` (or `tsc --noEmit`) — confirms docs MDX/routes are valid.
- `pnpm registry:build` — refreshes `apps/docs/public/r/*.json`.
- `pnpm build:skills` — re-tarballs `skills/keystoneui-react/` and `skills/{others}` for `keystoneui.io/skills/{name}.tar.gz`.

### Why this matters

Drift between component source and the skill / AGENTS.md / MCP registry is the single biggest reliability risk for AI consumers. The `6adc8c2` commit is the canonical example: motion/layering tokens were added to `AGENTS.md` but not to `SKILL.md`, leaving the skill stale until manual reflow. Treat the agent surface as code — synced together, not as an afterthought.

The eval suite at `skills/keystoneui-react/evals/evals.json` exists to catch this kind of drift; run it (or extend it) when you change a rule.

## Demo File Pattern

Every demo must follow this exact pattern:

```tsx
"use client";

import { MyComponent } from "@keystoneui/react/my-component";

export default function MyComponentDefault() {
  return <MyComponent>Content</MyComponent>;
}
```

## Demo Registry Pattern

In `apps/docs/demos/index.ts`:

```tsx
import MyComponentDefault from "./my-component/default";

// In the demos record:
"my-component-default": { component: MyComponentDefault, file: "my-component/default.tsx" },
```

## MDX Pattern

In `apps/docs/content/docs/components/my-component.mdx`:

```mdx
<ComponentPreview name="my-component-default" />
```

## Key File Locations

### Component sources
- Component: `packages/ui/src/{name}.tsx`
- Exports: `packages/ui/package.json`
- Build entries: `packages/ui/tsup.config.ts`
- Registry: `packages/ui/src/_registry.ts`
- Stories: `apps/storybook/stories/{name}.stories.tsx`
- Demos: `apps/docs/demos/{name}/`
- Demo registry: `apps/docs/demos/index.ts`
- MDX docs: `apps/docs/content/docs/components/{name}.mdx`
- Component nav: `apps/docs/content/docs/components/meta.json`

### AI agent surfaces
- Skill (consumers): `skills/keystoneui-react/SKILL.md` + `mcp.md`, `cli.md`, `customization.md`, `rules/*.md`
- Skill evals: `skills/keystoneui-react/evals/evals.json`
- AGENTS.md (root): `/AGENTS.md`
- AGENTS.md route: `apps/docs/app/agents-md/route.ts`
- LLMs.txt routes: `apps/docs/app/llms{,-full,-components}.txt/route.ts`
- MCP server: `packages/keystoneui-mcp/src/{server,tools,fetcher,config}.ts`
- MCP docs: `apps/docs/content/docs/(getting-started)/agents/{mcp-server,skills,llms-txt,agents-md}.mdx`

### Project-internal Claude/Cursor skills
- `.claude/skills/{component-architecture,design-tokens,popup-patterns,contributing}/SKILL.md`
- `.cursor/rules/*.mdc` (symlinks to the same canonical files)
