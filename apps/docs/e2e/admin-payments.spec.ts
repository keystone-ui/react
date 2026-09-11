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
const FILTERS_WITH_ONE = /Filters\s*1/;
const ROW_ACTION = /^Action/;
const ROW_ACTION_CASHOUT = /^Action Cashout/;
const ROW_CURRENCY = /^Currency/;
const ROW_PROVIDER = /^Provider/;
const ROW_CURRENCY_TWO = /^Currency 2 selected/;

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

/**
 * Dismiss an open menu and wait for it to go.
 *
 * `toBeVisible()` first is load-bearing: Escape arriving while the popup is
 * still animating open is swallowed, and the next assertion then waits out its
 * whole timeout on a menu that never closed.
 */
async function closeMenu(page: Page) {
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
}

async function addFilter(page: Page, label: string) {
  // Each new pill pushes the add-filter button along, so the next menu opens
  // against an anchor that has just moved. Waiting on the popup's own
  // presence either side of the click is what makes that deterministic —
  // clicking straight through catches the menu mid-animation, or catches the
  // previous one still closing.
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  await expect(menu).toHaveCount(0);
  await page.getByRole("button", { name: ADD_FILTER }).click();
  await expect(menu).toBeVisible();
  await menu.getByRole("menuitem", { name: label, exact: true }).click();
  await expect(pill(page, label)).toBeVisible();
  await expect(menu).toHaveCount(0);
}

/**
 * The drawer's drilldown rows, read as "Label value".
 *
 * Composed from the two spans rather than `textContent` for the same reason
 * the pills are: there is no whitespace between them, so the raw text reads
 * "ActionAll".
 */
function drawerRows(page: Page): Promise<string[]> {
  return page
    .locator('[data-slot="drawer-content"] button[type="button"]')
    .evaluateAll((nodes) =>
      nodes
        .filter((node) => node.children.length === 2)
        .map((node) =>
          [...node.children]
            .map((child) => child.textContent?.replace(/\s+/g, " ").trim())
            .join(" ")
        )
    );
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
    expect(await pills(page)).toEqual(["Action: All", "Status: All"]);

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
    await page.getByRole("button", { name: ROW_PROVIDER }).click();
    await page.getByRole("radio", { name: "Stripe" }).click();
    await page.keyboard.press("Escape");

    await page.setViewportSize({ height: 900, width: 1280 });
    expect(await pills(page)).toContain("Provider: Stripe");
  });

  test("a pill is cleared before it can be removed", async ({ page }) => {
    await openPayments(page);
    const total = await rowCount(page);
    const menu = page.locator('[data-slot="dropdown-menu-content"]');

    await addFilter(page, "Currency");
    expect(await pills(page)).toContain("Currency: All");

    // Empty and removable: the footer offers the way out.
    await pill(page, "Currency").click();
    await expect(
      menu.getByRole("button", { name: "Remove filter" })
    ).toBeVisible();
    await menu.getByRole("menuitemcheckbox", { name: "BTC" }).click();

    // Now it is doing something, so the footer offers to empty it instead.
    // A filter whose effect you can still see is not one you meant to delete.
    await expect(menu.getByRole("button", { name: "Clear" })).toBeVisible();
    await expect(
      menu.getByRole("button", { name: "Remove filter" })
    ).toBeHidden();
    await closeMenu(page);

    expect(await pills(page)).toContain("Currency: BTC");
    expect(await rowCount(page)).toBeLessThan(total);

    await pill(page, "Currency").click();
    await menu.getByRole("button", { name: "Clear" }).click();
    await menu.getByRole("button", { name: "Remove filter" }).click();

    expect(await pills(page)).toEqual(["Action: All", "Status: All"]);
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
    await closeMenu(page);

    await addFilter(page, "Currency");
    await page.getByRole("button", { name: ADD_FILTER }).click();
    expect(await page.getByRole("menuitem").allTextContents()).not.toContain(
      "Currency"
    );
    await closeMenu(page);

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
    expect(await pills(page)).toEqual(["Action: All", "Status: All"]);
  });

  test("a multi-select names its first value and counts the rest", async ({
    page,
  }) => {
    await openPayments(page);

    await addFilter(page, "Currency");
    await pill(page, "Currency").click();
    const menu = page.locator('[data-slot="dropdown-menu-content"]');
    await menu.getByRole("menuitemcheckbox", { name: "BTC" }).click();
    await menu.getByRole("menuitemcheckbox", { name: "ETH" }).click();

    // The footer spells out the number the pill only hints at, and offers the
    // way to empty the filter without taking the pill off the row.
    await expect(menu.getByText("2 selected")).toBeVisible();
    await closeMenu(page);

    // "2" alone would say how many without saying which.
    expect(await pills(page)).toContain("Currency: BTC, +1");

    await pill(page, "Currency").click();
    await menu.getByRole("button", { name: "Clear" }).click();
    await closeMenu(page);

    expect(await pills(page)).toContain("Currency: All");
  });

  test("columns sort from their headers, not from a filter pill", async ({
    page,
  }) => {
    await openPayments(page);

    // Sorting is not filtering, so it does not live in the filter row.
    expect(await pills(page)).not.toContain("Sort: Created, newest");

    const amounts = () =>
      page
        .locator('[data-slot="table-body"] tr td:nth-child(3)')
        .allTextContents();

    await page.getByRole("button", { name: "Amount", exact: true }).click();
    const descending = (await amounts()).map(Number);
    expect(descending).toEqual([...descending].sort((a, b) => b - a));

    await page.getByRole("button", { name: "Amount", exact: true }).click();
    const ascending = (await amounts()).map(Number);
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));

    // Only the columns that actually sort claim to. `aria-sort="none"` is the
    // correct value for a sortable column that is not the active one — the
    // wrong thing would be putting it on the four that do nothing, which is a
    // promise the table cannot keep.
    const sortStates = await page
      .locator('[data-slot="table-head"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("aria-sort")));

    expect(sortStates.filter(Boolean)).toHaveLength(4);
    expect(sortStates.filter((state) => state && state !== "none")).toEqual([
      "ascending",
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

  test("the drawer menu lists every filter with its current value", async ({
    page,
  }) => {
    await openPayments(page);

    // The pills fold away here, so the drawer is the only way in. Anything
    // missing from it is unreachable rather than merely inconvenient — which
    // is exactly what shipped: Action, Status and Sort had no mobile surface
    // at all.
    await expect(pill(page, "Action")).toBeHidden();
    await page.getByRole("button", { name: DRAWER_TRIGGER }).click();

    const labels = await drawerRows(page);

    for (const expected of [
      "Action All",
      "Status All",
      "Currency All",
      "Provider All",
      "Created Any",
      "Amount Any",
    ]) {
      expect(labels).toContain(expected);
    }
  });

  test("drilling into a filter narrows the table and updates its row", async ({
    page,
  }) => {
    await openPayments(page);
    const total = await rowCount(page);

    await page.getByRole("button", { name: DRAWER_TRIGGER }).click();
    await page.getByRole("button", { name: ROW_ACTION }).click();

    // The sub-screen, reached by drilling rather than by scrolling a column
    // of selects — the same shape the users drawer uses.
    await expect(
      page.getByRole("heading", { name: "Action", exact: true })
    ).toBeVisible();
    await page.getByRole("radio", { name: "Cashout" }).click();
    await page.getByRole("button", { name: "Back" }).click();

    expect(await rowCount(page)).toBeLessThan(total);
    await expect(
      page.getByRole("button", { name: ROW_ACTION_CASHOUT })
    ).toBeVisible();

    // The trigger carries the count, because nothing else at this width says
    // the table is filtered.
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("button", { name: DRAWER_TRIGGER })).toHaveText(
      FILTERS_WITH_ONE
    );

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("a multi-select row spells out what the pill abbreviates", async ({
    page,
  }) => {
    await openPayments(page);

    await page.getByRole("button", { name: DRAWER_TRIGGER }).click();
    await page.getByRole("button", { name: ROW_CURRENCY }).click();
    await page.getByRole("checkbox", { name: "BTC" }).click();
    await page.getByRole("checkbox", { name: "ETH" }).click();
    await page.getByRole("button", { name: "Back" }).click();

    // "2" alone would leave the row saying a number with no unit.
    await expect(
      page.getByRole("button", { name: ROW_CURRENCY_TWO })
    ).toBeVisible();
  });
});
