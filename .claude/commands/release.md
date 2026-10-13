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

Changesets already rolled into a prior beta live in `.changeset/pre/` (Changesets v3), so every `.md` at the top level of `.changeset/` (except `README.md`) is unconsumed and will trigger a bump. If there are none, stop.

If a **Version Packages** PR is already open (CI opens one whenever unconsumed changesets land on `main`), merging it does the same bump — prefer that and skip to Phase 2.

### 2. Bump

```
pnpm version-packages
```

This wraps three steps:

1. **`node scripts/sync-unreleased.mjs`** — regenerates `apps/docs/content/changelog/unreleased.mdx` from the unconsumed `.changeset/*.md` files so the dated mdx (next step) inherits real auto-generated content.
2. **`changeset version`** — rolls all changesets into `packages/ui/CHANGELOG.md` and `packages/keystoneui-mcp/CHANGELOG.md`, bumps `package.json` versions, moves the consumed changesets into `.changeset/pre/`.
3. **`node scripts/rotate-changelog.mjs`** — renames `unreleased.mdx` → `<TODAY>-v<NEW_VERSION>.mdx`, stamps `version`/`date` into the rotated frontmatter, drops a fresh empty `unreleased.mdx` stub.

Never run raw `pnpm changeset version`. The wrapped command handles changelog sync + rotation; the raw one leaves them stale.

### 3. Verify post-conditions

All of these must hold:

- `packages/ui/package.json` `version` field bumped (`git diff packages/ui/package.json`)
- `packages/ui/CHANGELOG.md` has a new top-level heading for the new version
- `apps/docs/content/changelog/<date>-v<ver>.mdx` exists with `version` + `date` frontmatter and the auto-derived content
- `apps/docs/content/changelog/unreleased.mdx` is the fresh empty stub
- the just-consumed changesets moved from `.changeset/` into `.changeset/pre/`

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
  .changeset/
```

`.changeset/` captures the consumed changesets moving into `.changeset/pre/` (pre-release mode) or being deleted (normal mode).

Commit + push:

```
git commit -m "chore: version packages"
git push origin main
```

The push triggers `.github/workflows/release.yml`, which runs `changesets/action@v2` with `publish-script: pnpm release`. It detects the new versions don't exist on npm and publishes them, then auto-creates a GitHub Release per package using the matching `CHANGELOG.md` section as the body.

## Phase 2 — npm publish (CI, no local action)

`changesets/action@v2` runs `turbo run build --filter=@keystoneui/storybook^... && changeset publish`. Idempotent — re-running after a successful publish is a no-op.

Auth is npm **Trusted Publishing** (OIDC): the job needs `id-token: write`, npm >= 11.5.1 (the workflow upgrades it), and **no** `NPM_TOKEN` / `NODE_AUTH_TOKEN` in the env — a configured token makes npm skip the OIDC exchange. If publish 404s or 403s, check the trusted-publisher entry for each package on npmjs.com (repo `keystone-ui/react`, workflow `release.yml`).

## Phase 3 — optional: level the npm dist-tags (needs the user's npm login)

`changeset publish` sets one dist-tag per package — `@keystoneui/react` → `beta`, `@keystoneui/mcp` → `latest` — and a Trusted Publishing credential can't manage dist-tags. Releases don't need this step: the docs install `@keystoneui/react@beta` and `npx @keystoneui/mcp` (`latest`), which are the tags CI moves. Leveling the other tag only matters for someone installing without a tag. The Release run's job summary lists the commands; they are, per published package:

```
npm dist-tag add <name>@<version> latest
npm dist-tag add <name>@<version> beta
```

These change the public registry, so hand them to the user to run (e.g. with the `!` prefix) rather than running them yourself. Verify with `npm view <name> dist-tags`.

## Exiting pre-release mode

When `0.1.0` is ready as a stable release (out of beta):

```
pnpm changeset pre exit
pnpm version-packages
```

That bumps to `0.1.0` (no `-beta.X` suffix), syncs + rotates the changelog, and the next push to `main` ships the stable release. Phase 3 then moves `beta` up to the stable version.

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
