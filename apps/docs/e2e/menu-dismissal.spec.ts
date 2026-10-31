import { expect, type Page, test } from "@playwright/test";

import { gotoPreview, settled } from "./preview";

/**
 * A single-select menu must close when a value is picked.
 *
 * Not a cosmetic complaint about a lingering popup. Base UI keeps a fullscreen
 * `position: fixed` backdrop with `pointer-events: auto` mounted while a menu
 * is open, so a menu that stays open swallows the user's next click *anywhere
 * on the page*. In a filter toolbar that presents as "the second filter is
 * broken", and it is invisible to a jsdom test, which has no hit-testing and
 * no backdrop geometry — `packages/ui/src/dropdown-menu.test.tsx` can prove the
 * popup unmounts, but only a browser can prove the next click lands.
 *
 * `DropdownMenuRadioItem` therefore defaults `closeOnClick` to `true` while
 * `DropdownMenuCheckboxItem` keeps Base UI's `false`. Both halves are pinned
 * here, because "fixing" the asymmetry breaks one block or the other.
 */

const ACTION_PILL = /^Action:/;
const STATUS_PILL = /^Status:/;
const CURRENCY_PILL = /^Currency:/;
const ADD_FILTER = /Add filter/;
const SINGLE_PAGE = /Page 1 of 1/;
const TICKETS_TRIGGER = /Status/;

async function rowCount(page: Page): Promise<number> {
  await settled(page);
  return page
    .locator('[data-slot="table-body"] tr:not([data-skeleton-row])')
    .count();
}

test.describe("admin-01 payment filters", () => {
  /**
   * Retargeted from the users toolbar, whose two filter dropdowns moved into a
   * drawer. The payments pills are the better home anyway: two adjacent
   * single-select menus *and* a multi-select one, so both halves of the
   * `closeOnClick` asymmetry are pinned against the same table.
   */
  test.beforeEach(async ({ page }) => {
    await gotoPreview(page, "block-admin-01");
    await page.getByRole("button", { name: "Payments" }).click();
    await expect(page.getByLabel("Search payments by email")).toBeVisible();
  });

  test("a picked filter closes its menu and narrows the table", async ({
    page,
  }) => {
    const total = await rowCount(page);
    expect(total).toBeGreaterThan(0);

    await page.getByRole("button", { name: ACTION_PILL }).click();
    await page.getByRole("menuitemradio", { name: "Cashout" }).click();

    await expect(page.getByRole("menuitemradio")).toHaveCount(0);
    expect(await rowCount(page)).toBeLessThan(total);
  });

  test("a second filter is still clickable after the first", async ({
    page,
  }) => {
    await page.getByRole("button", { name: ACTION_PILL }).click();
    await page.getByRole("menuitemradio", { name: "Cashout" }).click();

    // This is the click the inert backdrop used to eat.
    await page.getByRole("button", { name: STATUS_PILL }).click();
    await page.getByRole("menuitemradio", { name: "Completed" }).click();

    await expect(page.getByRole("button", { name: ACTION_PILL })).toContainText(
      "Cashout"
    );
    await expect(page.getByRole("button", { name: STATUS_PILL })).toContainText(
      "Completed"
    );
  });

  test("a multi-select stays open between picks", async ({ page }) => {
    // The other half: picking three currencies must not cost three trips. The
    // currency filter is an operator chip now, a popover with a chip list rather
    // than a menu, but the promise is the same one.
    await page.getByRole("button", { name: ADD_FILTER }).click();
    // Adding a filter opens its popover, so there is no pill to click first.
    await page.getByRole("menuitem", { exact: true, name: "Currency" }).click();

    await page.getByRole("option", { name: "BTC" }).click();
    // Still open: the rest of the list is there for the next pick.
    await expect(page.getByRole("option")).toHaveCount(4);
    await page.getByRole("option", { name: "ETH" }).click();

    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: CURRENCY_PILL })
    ).toContainText("BTC, +1");
  });

  test("filtering resets pagination", async ({ page }) => {
    await page.getByLabel("Search payments by email").fill("zzz-no-match");
    await expect(page.getByText(SINGLE_PAGE)).toBeVisible();
  });
});

test.describe("tickets-01 menus", () => {
  test("a single-select menu closes, and the next click lands", async ({
    page,
  }) => {
    await gotoPreview(page, "block-tickets-01");

    const trigger = page.getByRole("button", { name: TICKETS_TRIGGER }).first();
    await trigger.click();
    await page.getByRole("menuitemradio").first().click();
    await expect(page.getByRole("menuitemradio")).toHaveCount(0);

    await trigger.click();
    await expect(page.getByRole("menuitemradio").first()).toBeVisible();
  });

  test("the column menu stays open per item", async ({ page }) => {
    await gotoPreview(page, "block-tickets-01");

    await page.getByRole("button", { name: "Table options" }).click();

    const items = page.getByRole("menuitemcheckbox");
    // `count()` is a one-shot read with no auto-waiting, so it has to follow an
    // assertion that waits for the menu to actually be there. Reading it
    // straight after the click raced the popup and flaked about 1 run in 18.
    await expect(items.first()).toBeVisible();

    const count = await items.count();
    expect(count).toBeGreaterThan(1);

    await items.first().click();

    // Multi-select: still open, so the rest of the group is reachable.
    await expect(page.getByRole("menuitemcheckbox")).toHaveCount(count);
  });
});
