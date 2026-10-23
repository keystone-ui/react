import { expect, test } from "@playwright/test";

/**
 * Theme changes must not grow the browser history.
 *
 * The builder keeps its state in the query string. With `history: "push"`
 * every colour change (and every tick of a colour-area drag) became a new
 * history entry, so after any editing the Back button stepped through dozens
 * of intermediate themes instead of leaving the page. The URL still has to
 * carry the state, because shared links are the point of the builder.
 */

const PRESETS = ["Blue", "Green", "Orange", "Red", "Blue"];
const HEX_LABEL = /^#[0-9A-F]{6}$/i;
const HUE_PARAM = /primaryH=/;
const LIGHTNESS_PARAM = /primaryL=/;

test("changing the primary colour keeps the history stack flat", async ({
  page,
}) => {
  await page.goto("/theme-builder");
  // The primary colour trigger shows the current hex value.
  await page.getByRole("button", { name: HEX_LABEL }).first().click();
  const swatches = page.locator('[data-slot="popover-content"] button[title]');
  await expect(swatches.first()).toBeVisible();

  const before = await page.evaluate(() => history.length);
  for (const label of PRESETS) {
    // biome-ignore lint/performance/noAwaitInLoops: each click must land before the next, as a user would
    await page
      .locator(`[data-slot="popover-content"] button[title="${label}"]`)
      .click();
    await expect(page).toHaveURL(HUE_PARAM);
  }
  const after = await page.evaluate(() => history.length);

  expect(after).toBe(before);
  expect(page.url()).toMatch(LIGHTNESS_PARAM);
});
