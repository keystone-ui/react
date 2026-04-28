---
description: Cut a new release of @keystoneui/react — bump version, sync changelog, commit, push. CI publishes.
allowed-tools: Bash, Read, Edit
argument-hint: [optional dry-run flag]
---

One-stop release flow for `@keystoneui/react`. Bumps the version, syncs both changelogs, commits, pushes — CI takes over from there.

Pre-release mode (`beta` tag) is the default; bumps produce `X.Y.Z-beta.N` versions until `pnpm changeset pre exit` is run.

## Phase 1 — local (everything below is automated)

### 1. Pre-flight

Confirm there's something to release — at least one unconsumed changeset:

```
ls .changeset/*.md | grep -v -E "(README)"
```

Then check `.changeset/pre.json`'s `changesets[]` array — anything in the directory but NOT in that array is unconsumed and will trigger a bump. If everything is consumed, stop.

### 2. Bump

```
pnpm version-packages
```

This wraps three steps:

1. **`node scripts/sync-unreleased.mjs`** — regenerates `apps/docs/content/changelog/unreleased.mdx` from the unconsumed `.changeset/*.md` files so the dated mdx (next step) inherits real auto-generated content.
2. **`changeset version`** — rolls all changesets into `packages/ui/CHANGELOG.md` and `packages/keystoneui-mcp/CHANGELOG.md`, bumps `package.json` versions, records consumed changesets in `.changeset/pre.json`.
3. **`node scripts/rotate-changelog.mjs`** — renames `unreleased.mdx` → `<TODAY>-v<NEW_VERSION>.mdx`, stamps `version`/`date` into the rotated frontmatter, drops a fresh empty `unreleased.mdx` stub.

Never run raw `pnpm changeset version`. The wrapped command handles changelog sync + rotation; the raw one leaves them stale.

### 3. Verify post-conditions

All of these must hold:

- `packages/ui/package.json` `version` field bumped (`git diff packages/ui/package.json`)
- `packages/ui/CHANGELOG.md` has a new top-level heading for the new version
- `apps/docs/content/changelog/<date>-v<ver>.mdx` exists with `version` + `date` frontmatter and the auto-derived content
- `apps/docs/content/changelog/unreleased.mdx` is the fresh empty stub
- `.changeset/pre.json` lists the just-consumed changeset filenames in `changesets[]`

### 4. Sanity-build the docs

```
pnpm build --filter=@keystoneui/docs
```

Confirms the new MDX file passes the Zod schema in `apps/docs/source.config.ts`.

### 5. Stage, commit, push

Stage **only** the files version-packages touched (avoid `git add -A` — keep unrelated edits out of the bump commit):

```
git add \
  packages/ui/package.json \
  packages/ui/CHANGELOG.md \
  packages/keystoneui-mcp/package.json \
  packages/keystoneui-mcp/CHANGELOG.md \
  apps/docs/content/changelog/<date>-v<ver>.mdx \
  apps/docs/content/changelog/unreleased.mdx \
  .changeset/pre.json
```

Note: in pre-release mode, the changesets stay on disk (consumed ones are tracked in `.changeset/pre.json` instead of being deleted). In normal mode, also `git add .changeset/` to capture the deletions.

Commit + push:

```
git commit -m "chore: version packages"
git push origin main
```

The push triggers `.github/workflows/release.yml`, which runs `changesets/action@v1` with `publish: pnpm release`. It detects the new versions don't exist on npm and publishes them with the `beta` dist-tag, then auto-creates a GitHub Release per package using the matching `CHANGELOG.md` section as the body.

## Phase 2 — npm publish (CI, no local action)

`changesets/action@v1` runs `turbo run build --filter=@keystoneui/storybook^... && changeset publish`. Idempotent — re-running after a successful publish is a no-op.

If publish 404s: it's an auth issue, not a registry issue. Verify `NPM_TOKEN` (npmjs.com → Access Tokens) has read+write on the `@keystoneui` scope (or use a classic Automation token) and the workflow forwards it as both `NPM_TOKEN` and `NODE_AUTH_TOKEN` (the latter is consumed by setup-node's `~/.npmrc`).

## Exiting pre-release mode

When `0.1.0` is ready as a stable release (out of beta):

```
pnpm changeset pre exit
pnpm version-packages
```

That bumps to `0.1.0` (no `-beta.X` suffix), syncs + rotates the changelog, and the next push to `main` ships the stable release.

## Reporting

On a successful local run, print:

```
✅ /release phase 1 complete
- version: <OLD> → <NEW> in packages/ui/package.json
- changelog: apps/docs/content/changelog/<date>-v<NEW>.mdx (auto-synced from N changeset(s))
- pushed: <git sha> → origin/main
- next: watch the Release workflow run to confirm npm publish
```

On any failure, surface the failing command's output and the post-condition that didn't hold. Do not retry destructive operations (push/publish) automatically.
