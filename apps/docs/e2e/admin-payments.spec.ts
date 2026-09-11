import { expect, type Page, test } from "@playwright/test";

/**
 * The payments filter pattern: three controls inline, the long tail in a
 * panel, and everything applied shown as a removable chip.
 *
 * The chips are the part worth guarding. A panel hides what is applied, and
 * the chips are the only thing that answers "why am I looking at four rows?"
 * while it is shut — so if they stop reflecting state, the pattern is broken
 * even though every filter still works.
 */

const FILTERS_TRIGGER = /Filters/;
const SIDEBAR_TRIGGER = /Toggle Sidebar/i;
const TYPE_TRIGGER = /All types/;

const rowCount = (page: Page) =>
  page.locator('[data-slot="table-body"] tr').count();

const chipLabels = (page: Page) =>
  page.locator('[data-slot="tag-group-item"]').allTextContents();

async function openPayments(page: Page) {
  await page.goto("/preview/block-admin-01");
  const payments = page.getByRole("button", { name: "Payments" });
  if (await payments.isVisible()) {
    await payments.click();
  } else {
    await page.getByRole("button", { name: SIDEBAR_TRIGGER }).click();
    await expect(payments).toBeVisible();
    await payments.click();
    await page.keyboard.press("Escape");
  }
  await expect(page.getByLabel("Search payments by email")).toBeVisible();
}

test.describe("payments filters", () => {
  test("a panel filter narrows the table and shows a chip", async ({
    page,
  }) => {
    await openPayments(page);
    const total = await rowCount(page);

    await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
    await page
      .locator('[data-slot="drawer-content"]')
      .getByText("BTC", { exact: true })
      .click();
    await page.keyboard.press("Escape");

    expect(await rowCount(page)).toBeLessThan(total);
    expect(await chipLabels(page)).toContain("BTC");
  });

  test("the Provider select opens above the panel that contains it", async ({
    page,
  }) => {
    // A popup rendered inside a drawer is a layering question, not just a
    // filtering one: Base UI portals the listbox, and the drawer sits on its
    // own stacking layer. If the two disagree the options are unclickable.
    await openPayments(page);
    const total = await rowCount(page);

    await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
    await page.getByRole("combobox", { name: "Provider" }).click();
    await page.getByRole("option", { name: "Stripe" }).click();
    await page.keyboard.press("Escape");

    expect(await rowCount(page)).toBeLessThan(total);
    expect(await chipLabels(page)).toContain("Stripe");
  });

  test("the Filters badge counts only what the panel owns", async ({
    page,
  }) => {
    await openPayments(page);

    // Type lives in the toolbar, so it must not be counted — a badge that
    // counts a filter you can already see reads as a contradictory signal.
    await page.getByRole("button", { name: TYPE_TRIGGER }).click();
    await page.getByRole("menuitemradio", { name: "Cashout" }).click();

    const trigger = page.getByRole("button", { name: FILTERS_TRIGGER });
    await expect(trigger).toHaveText("Filters");
    expect(await chipLabels(page)).toContain("Cashout");
  });

  test("a chip removes only itself", async ({ page }) => {
    await openPayments(page);

    await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
    const drawer = page.locator('[data-slot="drawer-content"]');
    await drawer.getByText("BTC", { exact: true }).click();
    await drawer.getByText("ETH", { exact: true }).click();
    await page.keyboard.press("Escape");

    expect(await chipLabels(page)).toEqual(["BTC", "ETH"]);

    await page
      .locator('[data-slot="tag-group-item"]')
      .filter({ hasText: "BTC" })
      .getByRole("button")
      .click();

    expect(await chipLabels(page)).toEqual(["ETH"]);
  });

  test("Clear all empties the chips and restores every row", async ({
    page,
  }) => {
    await openPayments(page);
    const total = await rowCount(page);

    await page.getByRole("button", { name: TYPE_TRIGGER }).click();
    await page.getByRole("menuitemradio", { name: "Cashout" }).click();
    await page.getByLabel("Search payments by email").fill("konger");
    expect(await rowCount(page)).toBeLessThan(total);

    await page.getByRole("button", { name: "Clear all" }).click();

    expect(await rowCount(page)).toBe(total);
    expect(await chipLabels(page)).toEqual([]);
  });

  test("the table scrolls inside its own container, not the page", async ({
    page,
  }) => {
    await openPayments(page);

    // Eight columns need more room than the content area has. That is fine —
    // the container is the scroller — but the document must never scroll.
    const { needs, has, docOverflow } = await page.evaluate(() => {
      const container = document.querySelector('[data-slot="table-container"]');
      return {
        docOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        has: container?.clientWidth ?? 0,
        needs: container?.scrollWidth ?? 0,
      };
    });

    expect(needs).toBeGreaterThan(has);
    expect(docOverflow).toBeLessThanOrEqual(1);
  });
});

test.describe("payments filters on a phone", () => {
  test.use({ viewport: { height: 900, width: 375 } });

  test("folds the inline controls into the panel", async ({ page }) => {
    await openPayments(page);

    await expect(page.getByLabel("Search payments by email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: FILTERS_TRIGGER })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: TYPE_TRIGGER })).toBeHidden();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
