import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

import type { Page } from "playwright";
import { HeldPress, OFFSCREEN } from "./.storybook/held-press";
import viteConfig from "./vite.config";

// The press record (`.storybook/held-press.ts`) of each page, keyed by page
// because one config serves every browser page (one per worker). It records
// only the presses `pointerDown` sends.
const heldPages = new WeakMap<Page, HeldPress>();
function heldPress(page: Page): HeldPress {
  let press = heldPages.get(page);
  if (!press) {
    press = new HeldPress({
      down: () => page.mouse.down(),
      move: (x, y) => page.mouse.move(x, y),
      up: () => page.mouse.up(),
    });
    heldPages.set(page, press);
  }
  return press;
}

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
                // Moves the pointer outside the viewport, where it hovers
                // nothing (`pointerMoveAway` goes to the corner, which a
                // control can occupy).
                pointerMoveOffscreen: async (ctx) => {
                  await ctx.page.mouse.move(OFFSCREEN.x, OFFSCREEN.y);
                },
                pointerDown: async (ctx) => {
                  await heldPress(ctx.page).down();
                },
                pointerUp: async (ctx) => {
                  await heldPress(ctx.page).up();
                },
                // Lets go of a press `pointerDown` left held (a play that
                // failed or timed out before its `pointerUp`): moves the
                // pointer outside the viewport, then sends an up. Resolves
                // false and sends nothing when the record holds no press
                // (no down sent since the last successful up or release),
                // because an unpaired `mouse.up()` still sends the page a
                // trusted pointerup and mouseup.
                pointerRelease: async (ctx) =>
                  await heldPress(ctx.page).release(),
                // Real `prefers-reduced-motion`, for plays that compare a
                // smooth scroll with an instant one.
                emulateReducedMotion: async (ctx, reduce: boolean) => {
                  await ctx.page.emulateMedia({
                    reducedMotion: reduce ? "reduce" : "no-preference",
                  });
                },
                // A real wheel (or trackpad) scroll over an element.
                wheelOver: async (
                  ctx,
                  selector: string,
                  deltaX: number,
                  deltaY: number
                ) => {
                  const box = await ctx.iframe.locator(selector).boundingBox();
                  if (!box) {
                    throw new Error(`wheelOver: no box for ${selector}`);
                  }
                  await ctx.page.mouse.move(
                    box.x + box.width / 2,
                    box.y + box.height / 2
                  );
                  await ctx.page.mouse.wheel(deltaX, deltaY);
                },
                // The element's painted pixels as a base64 PNG, for plays
                // that must see what a mask or a gradient really draws.
                screenshotBase64: async (ctx, selector: string) => {
                  const png = await ctx.iframe.locator(selector).screenshot();
                  return png.toString("base64");
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
