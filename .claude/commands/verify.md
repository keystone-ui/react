---
description: Run check + targeted build/tests after a change. Routes phases by git diff. Attempts fixes on failure.
allowed-tools: Bash, Monitor, BashOutput, Read, Edit, Write, Grep, Glob, Skill
argument-hint: [optional summary of the change — e.g. "combobox keyboard nav fix" — used in the report; defaults to "the most recently implemented change"]
---

Post-implementation verification gate for the keystoneui repo. Determines which phases are relevant from the current git diff, runs them, and — on failure — attempts up to 3 fixes per phase before giving up.

This mirrors `.github/workflows/ci.yml` (lint → unit → storybook tests) rather than the lighter `.husky/pre-push` (`pnpm check && pnpm build`). The intent is "ready to merge," not "ready to push."

Run phases in order. Do **not** skip later phases because earlier phases failed; the report needs pass/fail per phase.

## 0. Decide scope from `git diff --name-only HEAD`

Compute the set of changed paths once and store the booleans you need:

- `UI_CHANGED` — any path matches `^packages/ui/src/`
- `STORIES_CHANGED` — any path matches `^apps/storybook/`
- `DOCS_CHANGED` — any path matches `^apps/docs/`
- `MCP_CHANGED` — any path matches `^packages/keystoneui-mcp/`
- `ROOT_CONFIG_CHANGED` — any path matches `^(turbo\.json|package\.json|pnpm-workspace\.yaml|biome\.jsonc|registry\.json|tsconfig.*\.json)$` or `^packages/typescript-config/`
- `ONLY_DOCS_MD` — every changed path matches `^apps/docs/content/.*\.mdx?$` or `\.md$`

If `ONLY_DOCS_MD` is true and `ROOT_CONFIG_CHANGED` is false, run **phase 1 only** and skip 2–4. Print the report with "skipped: docs/MD-only change."

If the diff is empty (e.g. all changes already committed and you want to verify HEAD), fall back to `git diff --name-only HEAD~1 HEAD` and use the same routing.

## 1. Lint / format check (always)

```
pnpm check
```

This is `ultracite check` (Biome). Cheap; always run. On failure, prefer `pnpm fix` for any phase-5 fix attempt — it's the project's blessed auto-fix path — then re-run `pnpm check` to confirm the fix landed without leaving anything dirty.

## 2. Build

Targeted by what changed:

- If `ROOT_CONFIG_CHANGED` or (`UI_CHANGED` and `STORIES_CHANGED`) or (`UI_CHANGED` and `DOCS_CHANGED`) or `MCP_CHANGED`: `pnpm build`
- Else if `UI_CHANGED`: `pnpm build --filter=@keystoneui/react`
- Else if `STORIES_CHANGED`: `pnpm build --filter=storybook`
- Else if `DOCS_CHANGED`: `pnpm build --filter=docs`

Use `run_in_background: true` + `Monitor` — turbo builds can take a couple of minutes. Watch for the final turbo summary line (`Tasks: X successful, Y total`) to decide pass/fail.

## 3. Unit tests — only if `UI_CHANGED` or `ROOT_CONFIG_CHANGED`

```
pnpm test --filter=@keystoneui/react
```

Vitest jsdom suite (`packages/ui/vitest.config.ts`). Same streaming pattern as build.

## 4. Storybook interaction tests — only if `UI_CHANGED` or `STORIES_CHANGED` or `ROOT_CONFIG_CHANGED`

```
pnpm test --filter=storybook
```

Vitest with `@vitest/browser-playwright` headless Chromium (`apps/storybook/vitest.config.ts`). On a cold cache the first run can be slow — give it generous time before declaring failure. CI does a warm run (`|| true`) before the real run; if the first run fails on what looks like cache-warming output, retry once before counting it against the fix budget.

If Playwright complains about missing browsers, run `pnpm exec playwright install --with-deps chromium` once and retry — that's a one-time setup, not a fix.

There is no separate `agent-browser` smoke step. The storybook test suite already drives the stories headlessly, so a live dev-stack browser pass would just duplicate coverage. (If a future change adds an interactive surface that's not covered by stories, this is the place to add an `agent-browser` step.)

## 5. Fix-on-failure loop

For any phase that fails:

1. Read the failure output. Identify the root cause (file:line).
2. Make a minimal fix. **Never modify tests to make them pass** unless the test itself is demonstrably wrong (flaky selector, stale snapshot, expected value contradicts the change's intent) — in that case, justify the test change in the report.
3. Re-run **only that phase**. Do not re-run earlier phases that already passed.
4. Cap at **3 fix attempts per phase**. If still failing after attempt 3, stop that phase, record the last error + attempted fixes, and continue to the next phase.

For Biome failures specifically, `pnpm fix` is the project's blessed auto-fix command — try it once before any hand edits, then re-run `pnpm check`.

## 6. Report

Print a single concise block at the end:

```
🔎 /verify report
- check:    ✅ pass  (ultracite)
- build:    ✅ pass  (pnpm build --filter=@keystoneui/react)
- unit:     ✅ pass  (@keystoneui/react — N tests)
- stories:  ⚠️  partial — Combobox.test fails on Chromium
- fixes:    1 applied — packages/ui/src/combobox.tsx:142
- skipped:  docs (no changes)
```

Use ✅ / ❌ / ⚠️ markers, file:line for any references, keep the whole report under ~12 lines. Single-line happy path: `✅ /verify — check, build, unit, stories all green`.

Never declare success if any phase finished with ❌ after exhausting fix attempts — say so explicitly so the caller knows manual intervention is needed.
