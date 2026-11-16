import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import type { CDPSession } from "playwright";
import { defineConfig, mergeConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

import viteConfig from "./vite.config";

const hoverSessions = new WeakMap<object, CDPSession>();

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, ".storybook"),
              storybookScript: "pnpm dev --no-open",
            }),
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              provider: playwright({}),
              headless: true,
              instances: [{ browser: "chromium" }],
              // Real mouse down/up for plays that must hold a press, so
              // `:active` really applies (user-event can click, not hold).
              // Coordinates come from Playwright's own box for the element,
              // which accounts for the tester iframe's offset and scale.
              commands: {
                pointerMoveTo: async (ctx, selector: string) => {
                  const box = await ctx.iframe.locator(selector).boundingBox();
                  if (!box) {
                    throw new Error(`pointerMoveTo: no box for ${selector}`);
                  }
                  await ctx.page.mouse.move(
                    box.x + box.width / 2,
                    box.y + box.height / 2
                  );
                },
                pointerMoveAway: async (ctx) => {
                  await ctx.page.mouse.move(0, 0);
                },
                pointerDown: async (ctx) => {
                  await ctx.page.mouse.down();
                },
                pointerUp: async (ctx) => {
                  await ctx.page.mouse.up();
                },
                // A touch screen: `(hover: none)`, so `hover:` rules (gated
                // behind `@media (hover: hover)` in base.css) stop applying.
                // One DevTools session per page: an emulation override lives
                // only as long as the session that set it.
                emulateNoHover: async (ctx, on: boolean) => {
                  let session = hoverSessions.get(ctx.page);
                  if (!session) {
                    session = await ctx.page.context().newCDPSession(ctx.page);
                    hoverSessions.set(ctx.page, session);
                  }
                  // Chromium ignores a `hover` feature in setEmulatedMedia;
                  // touch emulation is what flips `(hover: hover)` to false.
                  await session.send("Emulation.setTouchEmulationEnabled", {
                    enabled: on,
                    maxTouchPoints: 1,
                  });
                },
              },
            },
            exclude: ["**/node_modules/**"],
            setupFiles: ["./.storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  })
);
