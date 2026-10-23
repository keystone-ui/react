import { expect, test } from "@playwright/test";

/**
 * Every top-level section shares one site header.
 *
 * `/blocks` shipped with no header, nav or footer: it lived outside the
 * `(home)` route group, so only the bare root layout wrapped it, and the
 * "Blocks" link in the navbar dead-ended on a page with no way back. The
 * header is asserted to appear exactly once, which also guards against a
 * nested layout wrapping `HomeLayout` a second time.
 */

const SECTIONS = ["/", "/gallery", "/blocks", "/theme-builder"];

test.describe("top-level sections render the site header", () => {
  for (const path of SECTIONS) {
    test(`${path} shows the shared header exactly once`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("header#nd-nav")).toHaveCount(1);
      await expect(
        page.locator("header#nd-nav").getByRole("link", { name: "Blocks" })
      ).toBeVisible();
    });
  }
});
