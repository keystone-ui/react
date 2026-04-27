---
description: Start the keystoneui dev stack in the background and wait for it to be ready.
allowed-tools: Bash, Monitor, BashOutput
argument-hint: [optional services to wait for, e.g. "storybook" — defaults to "storybook docs ui"]
---

Start the full keystoneui dev stack in one background shell and wait until the requested services are ready.

**Default wait set:** `storybook docs ui`. If `$ARGUMENTS` is non-empty, treat it as a space-separated subset of those three names and only wait on what's listed.

`pnpm dev` is `turbo run dev`, which fans out to four workspace `dev` scripts in parallel:
- `apps/storybook` — `storybook dev -p 6006` (Vite + Storybook v10)
- `apps/docs` — `next dev` (Next.js 16 + Fumadocs, port 3000)
- `packages/ui` — `tsup --watch` (no port; emits `packages/ui/dist/`)
- `packages/keystoneui-mcp` — `tsup --watch` (no port; not in the wait set)

The `ui` watcher is load-bearing: storybook stories import via `@keystoneui/react/<component>`, which resolves through `packages/ui/package.json`'s `exports` field to `dist/` files. Until tsup completes its first build, those imports 404 inside storybook iframes — which is why `ui` is in the default wait set.

`turbo.json` does **not** set `ui: "tui"`, so no `TURBO_UI=stream` override is needed (unlike fyves).

1. **Launch the stack in the background.** Use Bash with `run_in_background: true`:
   ```
   pnpm dev
   ```
   Capture the shell ID.

2. **Wait for readiness.** In parallel for each name in the wait set:
   - **storybook** (port 6006): Monitor the background shell for a stdout line matching `Storybook .* started`. As a backstop (Storybook v10 line drift, slow Vite cold-warm), poll the port:
     ```
     until curl -sf -o /dev/null http://localhost:6006/iframe.html 2>/dev/null; do sleep 0.5; done
     ```
   - **docs** (port 3000): Monitor for a stdout line matching `Ready in` or `Local:.*http://localhost:3000`. Backstop:
     ```
     until curl -sf -o /dev/null http://localhost:3000 2>/dev/null; do sleep 0.5; done
     ```
   - **ui** (no port): Monitor for a stdout line containing `Build success` from the `packages/ui` tsup watcher. Turbo prefixes lines with `@keystoneui/react:dev:` — prefer matching that prefix when present so you don't accept the `keystoneui-mcp` watcher's first build by mistake. If no prefix is visible, the first `Build success` is good enough.

3. **Report.** Once every service in the wait set has signaled ready, print exactly:
   ```
   ✅ keystoneui dev stack ready
   - storybook: http://localhost:6006
   - docs:      http://localhost:3000
   - ui:        tsup --watch (packages/ui — initial build complete)
   Shell ID: <id> — tail with Monitor, stop with /dev-stop.
   ```
   Replace `<id>` with the actual background shell ID. Omit any line for a service that wasn't in the wait set, but always show the shell ID.

4. **Do not kill the background shell** from this command under any circumstances. Stopping is `/dev-stop`'s job.
