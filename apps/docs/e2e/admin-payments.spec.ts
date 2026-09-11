import { expect, type Page, test } from "@playwright/test";

/**
 * The payments filter pattern: self-describing pills, added on demand.
 *
 * The invariant worth guarding is that applied state is never invisible. Every
 * pill names its own dimension, so the control *is* the record of what is
 * applied — there is no chip row to fall out of sync, and a filter holding a
 * value must always show its pill even if nobody asked for it.
 */

const ADD_FILTER = /Add filter/;
const SIDEBAR_TRIGGER = /Toggle Sidebar/i;
const DRAWER_TRIGGER = /Filters/;

const rowCount = (page: Page) =>
  page.locator('[data-slot="table-body"] tr').count();

/** Every pill, read as "Label: value" the way a person would scan the row. */
function pills(page: Page): Promise<string[]> {
  // Composed from the parts rather than read off `textContent`: `Button`
  // wraps its children in one span and there is no whitespace between the
  // label and the value, so the raw text reads "Action:Cashout".
  return page.locator("[data-filter-pill]").evaluateAll((nodes) =>
    nodes.map((node) => {
      const all = node.textContent?.trim() ?? "";
      const label =
        node.querySelector("[data-pill-label]")?.textContent?.trim() ?? "";
      return label ? `${label} ${all.slice(label.length).trim()}` : all;
    })
  );
}

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

async function addFilter(page: Page, label: string) {
  await page.getByRole("button", { name: ADD_FILTER }).click();
  await page.getByRole("menuitem", { name: label, exact: true }).click();
  // Each new pill pushes the add-filter button along, so the next menu opens
  // against a moving anchor. Wait for the row to settle before going again.
  await expect(pill(page, label)).toBeVisible();
}

/** The pill for one filter, matched on its label rather than its value. */
function pill(page: Page, label: string) {
  return page
    .locator("[data-filter-pill]")
    .filter({ has: page.locator(`[data-pill-label]:text-is("${label}:")`) });
}

test.describe("payments filter pills", () => {
  test("every pill names the dimension it filters", async ({ page }) => {
    await openPayments(page);

    // The bug this replaces: a trigger reading "Deposit" beside one reading
    // "All statuses" — one naming a value without its dimension, the other a
    // dimension without a value.
    expect(await pills(page)).toEqual([
      "Action: All",
      "Status: All",
      "Sort: Created, newest",
    ]);

    await pill(page, "Action").click();
    await page.getByRole("menuitemradio", { name: "Cashout" }).click();

    expect(await pills(page)).toContain("Action: Cashout");
  });

  test("a filter holding a value always shows its pill", async ({ page }) => {
    await openPayments(page);

    // Provider is not a default pill and was never added by hand. Setting it
    // through the only other surface that can — the drawer — must still
    // surface it, or the table would be narrowed by something invisible.
    await page.setViewportSize({ height: 900, width: 375 });
    await page.getByRole("button", { name: DRAWER_TRIGGER }).click();
    await page.getByRole("combobox", { name: "Provider" }).click();
    await page.getByRole("option", { name: "Stripe" }).click();
    await page.keyboard.press("Escape");

    await page.setViewportSize({ height: 900, width: 1280 });
    expect(await pills(page)).toContain("Provider: Stripe");
  });

  test("adding a filter shows an empty pill; removing it clears the value", async ({
    page,
  }) => {
    await openPayments(page);
    const total = await rowCount(page);

    await addFilter(page, "Currency");
    expect(await pills(page)).toContain("Currency: All");

    await pill(page, "Currency").click();
    await page.getByRole("menuitemcheckbox", { name: "BTC" }).click();
    await page.keyboard.press("Escape");

    expect(await pills(page)).toContain("Currency: BTC");
    expect(await rowCount(page)).toBeLessThan(total);

    await pill(page, "Currency").click();
    await page.getByRole("menuitem", { name: "Remove filter" }).click();

    expect(await pills(page)).not.toContain("Currency: BTC");
    expect(await rowCount(page)).toBe(total);
  });

  test("the add-filter menu never offers a pill already on the row", async ({
    page,
  }) => {
    await openPayments(page);

    await page.getByRole("button", { name: ADD_FILTER }).click();
    expect(await page.getByRole("menuitem").allTextContents()).toEqual([
      "Currency",
      "Provider",
      "Created",
      "Amount",
    ]);
    await page.keyboard.press("Escape");

    await addFilter(page, "Currency");
    await page.getByRole("button", { name: ADD_FILTER }).click();
    expect(await page.getByRole("menuitem").allTextContents()).not.toContain(
      "Currency"
    );
    await page.keyboard.press("Escape");

    // With every filter shown there is nothing left to add, so the control
    // goes rather than opening onto an empty menu.
    for (const label of ["Provider", "Created", "Amount"]) {
      // biome-ignore lint/performance/noAwaitInLoops: one menu, opened in turn
      await addFilter(page, label);
    }
    await expect(page.getByRole("button", { name: ADD_FILTER })).toBeHidden();
  });

  test("a range pill reads as its bounds", async ({ page }) => {
    await openPayments(page);
    const total = await rowCount(page);

    await addFilter(page, "Amount");
    expect(await pills(page)).toContain("Amount: Any");

    await pill(page, "Amount").click();
    await page.getByLabel("Min").fill("1");
    await page.getByLabel("Max").fill("500");
    await page.keyboard.press("Escape");

    expect(await pills(page)).toContain("Amount: 1 – 500");
    expect(await rowCount(page)).toBeLessThan(total);
  });

  test("Clear all empties every pill and restores every row", async ({
    page,
  }) => {
    await openPayments(page);
    const total = await rowCount(page);

    await pill(page, "Action").click();
    await page.getByRole("menuitemradio", { name: "Cashout" }).click();
    await page.getByLabel("Search payments by email").fill("konger");
    expect(await rowCount(page)).toBeLessThan(total);

    await page.getByRole("button", { name: "Clear all" }).click();

    expect(await rowCount(page)).toBe(total);
    expect(await pills(page)).toEqual([
      "Action: All",
      "Status: All",
      "Sort: Created, newest",
    ]);
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

  test("the drawer reaches every filter", async ({ page }) => {
    await openPayments(page);

    // The pills fold away here, so the drawer is the only way in. Anything
    // missing from it is unreachable rather than merely inconvenient — which
    // is exactly what shipped: Action, Status and Sort had no mobile surface
    // at all.
    await expect(pill(page, "Action")).toBeHidden();
    await page.getByRole("button", { name: DRAWER_TRIGGER }).click();

    for (const name of ["Action", "Status", "Provider", "Sort"]) {
      // biome-ignore lint/performance/noAwaitInLoops: one drawer, read in turn
      await expect(page.getByRole("combobox", { name })).toBeVisible();
    }
    await expect(page.getByLabel("Min")).toBeVisible();
    await expect(page.getByLabel("After")).toBeVisible();
  });

  test("filters set on a phone narrow the table", async ({ page }) => {
    await openPayments(page);
    const total = await rowCount(page);

    await page.getByRole("button", { name: DRAWER_TRIGGER }).click();
    await page.getByRole("combobox", { name: "Action" }).click();
    await page.getByRole("option", { name: "Cashout" }).click();
    await page.getByRole("button", { name: "Done" }).click();

    expect(await rowCount(page)).toBeLessThan(total);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
