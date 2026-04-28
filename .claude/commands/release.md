---
description: Cut a new release of @keystoneui/react — bump version, rotate changelog, then publish.
allowed-tools: Bash, Read, Edit
argument-hint: [optional dry-run flag]
---

Two-phase release flow for `@keystoneui/react`. Phase 1 (version) prepares the bump locally; phase 2 (publish) ships it to npm. They are deliberately separate so the version bump goes through PR review.

The package is in **changesets pre-release mode** (tag `beta`). Bumps produce `0.1.0-beta.X` versions, not stable semver, until you exit pre.

## Phase 1 — version bump (local)

1. **Pre-flight.** Confirm there's something to release:
   ```
   ls .changeset/*.md | grep -v -E "(README|config\.json|pre\.json)"
   ```
   If empty, stop. There's no work to release.

2. **Bump + rotate.** Run the wrapped command:
   ```
   pnpm version-packages
   ```
   This is `changeset version && node scripts/rotate-changelog.mjs`. Together they:
   - Roll all `.changeset/*.md` into `packages/ui/CHANGELOG.md`
   - Bump `packages/ui/package.json` version
   - Delete the consumed `.changeset/*.md` files
   - Rename `apps/docs/content/changelog/unreleased.mdx` → `apps/docs/content/changelog/<TODAY>-v<NEW_VERSION>.mdx`
   - Stamp `version` + `date` into the renamed file's frontmatter
   - Drop a fresh empty `unreleased.mdx`

   Never run raw `pnpm changeset version` — it skips the rotation and you'll end up with a stale Unreleased entry that should have been versioned.

3. **Verify post-conditions.** All four must hold:
   - `packages/ui/package.json` `version` field bumped (`git diff packages/ui/package.json`)
   - `packages/ui/CHANGELOG.md` has a new top heading for the new version
   - `apps/docs/content/changelog/<date>-v<ver>.mdx` exists with `version` + `date` frontmatter
   - `apps/docs/content/changelog/unreleased.mdx` exists as a fresh stub (no body content beyond the boilerplate)

   If `unreleased.mdx` was missing before the run, the rotate script will have errored — either the rotation already ran, or the file was deleted by hand. Fix manually: re-create `unreleased.mdx` from the most recent versioned entry as a template, or skip the rotation by running only `pnpm changeset version` and stamping the changelog by hand.

4. **Sanity-build the docs.** Confirms the new MDX file passes the Zod schema in `apps/docs/source.config.ts`:
   ```
   pnpm build --filter=docs
   ```

5. **Commit and PR.** A single commit named `chore: version packages` is the convention. Open a PR and merge once review is happy. Do not publish from the local machine.

## Phase 2 — publish (after merge)

After the version-bump PR lands on `main`:

```
pnpm release
```

This is `turbo run build --filter=storybook^... && changeset publish`. It builds everything `storybook` depends on (which transitively includes `@keystoneui/react`) and publishes packages whose versions don't yet exist on npm. Idempotent — re-running after a successful publish is a no-op.

## Exiting pre-release mode

When `0.1.0` is ready to ship as a stable release (out of beta), exit pre first:

```
pnpm changeset pre exit
pnpm version-packages
```

That bumps to `0.1.0` (no `-beta.X` suffix), rotates the changelog, and the publish phase ships the stable release.

## Reporting

On a successful phase 1 run, print:
```
✅ /release phase 1 complete
- version: <OLD> → <NEW> in packages/ui/package.json
- changelog: apps/docs/content/changelog/<date>-v<NEW>.mdx
- next: review the diff, commit as `chore: version packages`, open a PR
```

On a successful phase 2 run, print:
```
✅ /release phase 2 complete
- @keystoneui/react@<NEW> published to npm
- next: nothing — ship is sailed
```

On any failure, surface the failing command's output and the post-condition that didn't hold. Do not retry destructive operations automatically.
