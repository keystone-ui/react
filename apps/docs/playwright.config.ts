import { defineConfig, devices } from "@playwright/test";

/**
 * Layout tests for the block previews.
 *
 * Separate from the `vitest` suite in `tests/`, which is node-only and asserts
 * on files. This one needs a real browser measuring real layout, because the
 * failure it exists to catch — a grid or flex child pushing its track open and
 * handing the document a horizontal scrollbar — has no representation outside
 * a rendered page.
 *
 * Runs against a production build. `next dev` serves the same markup but with
 * different timing, and a flaky layout test is worse than none.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3210",
    // Charts animate SVG attributes from JS, which moves geometry while a
    // measurement is being taken. The blocks honour this setting through
    // `useReducedMotion`, so the tests exercise a real code path rather than a
    // test-only flag.
    reducedMotion: "reduce",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start --port 3210",
    url: "http://127.0.0.1:3210",
    // Reusing a dev server here would hand the tests differently-timed markup
    // and they would pass while testing something else.
    reuseExistingServer: false,
    stdout: "ignore",
    timeout: 300_000,
  },
});
