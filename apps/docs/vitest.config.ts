import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

/**
 * Two projects:
 *  - `unit`:  pure tests over source and committed files. The default.
 *  - `built`: tests over `.next/` after `next build`. Opt in with
 *             `vitest run --project built`; CI runs it in the docs e2e job
 *             right after the production build.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "."),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["lib/**/*.test.ts", "tests/**/*.test.ts"],
          exclude: ["**/*.built.test.ts", "**/node_modules/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "built",
          environment: "node",
          include: ["tests/**/*.built.test.ts"],
        },
      },
    ],
  },
});
