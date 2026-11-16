import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

import viteConfig from "./vite.config";

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
              //
              // Deliberately no hover-capability (touch) emulation: on
              // headless Linux, switching Chromium's touch emulation off
              // again leaves `(hover: hover)` false for the rest of the page,
              // so every later hover check in that worker fails (macOS
              // restores it, so it passes locally). A play that needs a press
              // without hover presses the item and slides the pointer off it
              // while the button is still down: the item keeps `:active` and
              // loses `:hover`, which is what a touch press gives the CSS.
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
