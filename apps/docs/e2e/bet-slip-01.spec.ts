import { expect, test } from "@playwright/test";

import { gotoPreview } from "./preview";

/**
 * bet-slip-01's rules, in the order the slip enforces them. The odds feed is
 * a setInterval, so the clock is installed before the page loads and moved
 * by hand: a price only changes when the test says so.
 */
const PLACE_BET = /^Place bet/;

test.describe("bet slip", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoPreview(page, "block-bet-slip-01");
  });

  const placeButton = (page: import("@playwright/test").Page) =>
    page.locator('[data-slot="card-footer"] button');

  test("prices a single and places it", async ({ page }) => {
    await expect(page.getByText("Potential return")).toBeVisible();
    await expect(placeButton(page)).toHaveText("Place bet · €10.00");
    await expect(
      page.locator('[data-slot="card-footer"] dd').last()
    ).toHaveText("€21.00");

    await placeButton(page).click();
    await expect(page.getByText("Bet placed")).toBeVisible();
  });

  test("blocks a stake over the remaining daily limit", async ({ page }) => {
    await page.getByLabel("Stake on Over 2.5").fill("35");

    await expect(page.getByText("Over your daily limit").first()).toBeVisible();
    await expect(
      page.getByText("You can stake €40.00 more today")
    ).toBeVisible();
    await expect(placeButton(page)).toBeDisabled();

    await page.getByLabel("Stake on Over 2.5").fill("30");
    await expect(placeButton(page)).toHaveText("Place bet · €40.00");
  });

  test("makes the punter accept a price change before placing", async ({
    page,
  }) => {
    await page.clock.runFor(6000);

    await expect(page.getByText("Odds have changed")).toBeVisible();
    await expect(placeButton(page)).toHaveText("Accept odds changes");

    await placeButton(page).click();
    await expect(page.getByText("Odds have changed")).toBeHidden();
    await expect(placeButton(page)).toHaveText(PLACE_BET);
  });

  test("removes a selection and keeps the accumulator honest", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Accumulator" }).click();
    await expect(page.getByText("3-fold @")).toBeVisible();

    await page.getByRole("button", { name: "Remove Celtics" }).click();
    await page.getByRole("button", { name: "Remove Over 2.5" }).click();
    // One leg left: there is no accumulator to price, so the slip falls back
    // to singles rather than stranding the punter without a stake input.
    await expect(page.getByRole("tab", { name: "Accumulator" })).toBeDisabled();
    await expect(page.getByLabel("Stake on Arsenal")).toBeVisible();
  });
});
