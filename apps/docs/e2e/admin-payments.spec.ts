import { readFileSync } from "node:fs";

import { expect, type Page, test } from "@playwright/test";

import { gotoPreview, settled } from "./preview";

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
const NEXT_PAGE = /next page/i;
const ROW_ACTIONS = /^Actions for payment/;
const ROW_CURRENCY_TWO = /^Currency 2 selected/;
const OPERATOR = /^Operator:/;
const SORT_TRIGGER = /^Sort:/;
const SUMMARY_TOTAL = /of (\d+)/;
const ACTION_PILL_TRIGGER = /^Action:/;
const URL_VIEW = /view=payments/;
const URL_TYPE = /type=cashout/;
const URL_SORT = /sort=amount\.desc/;

/** Real rows only, once the request has answered — never the skeleton. */
async function rowCount(page: Page): Promise<number> {
  await settled(page);
  return page
    .locator('[data-slot="table-body"] tr:not([data-skeleton-row])')
    .count();
}

/**
 * The amount column as the sort and the filter see it. The cell shows a
 * formatted value (`10,000.00`), so the raw string rides on `data-amount`.
 */
async function rawAmounts(page: Page): Promise<string[]> {
  await settled(page);
  return page
    .locator('[data-slot="table-body"] [data-amount]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-amount") ?? "")
    );
}

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
  await gotoPreview(page, "block-admin-01");
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
  await settled(page);
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

async function closePopover(page: Page) {
  await expect(popover(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popover(page)).toHaveCount(0);
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

  // The new pill mounts with its own popup open. Dismiss it, so every test
  // starts from a closed row the way it did before that behaviour existed.
  const opened = page.locator(
    '[data-slot="dropdown-menu-content"], [data-slot="popover-content"]'
  );
  await expect(opened).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(opened).toHaveCount(0);
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

/**
 * The pill for one filter, matched on its dimension rather than its text: an
 * operator chip's visible label changes with its operator ("Currency is not:"),
 * and the test should not.
 */
function pill(page: Page, label: string) {
  return page.locator(`[data-filter-pill][data-filter-label="${label}"]`);
}

/** An operator chip's popover. */
function popover(page: Page) {
  return page.locator('[data-slot="popover-content"]');
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

  test("a new pill lands at the end of the row", async ({ page }) => {
    await openPayments(page);

    // Ordering by the descriptor table instead of by insertion put each new
    // pill in its canonical slot — add Amount then Currency and Currency
    // landed in front of it, nowhere near the button just clicked.
    await addFilter(page, "Amount");
    await addFilter(page, "Currency");
    await addFilter(page, "Created");

    expect(
      await page
        .locator("[data-filter-pill] [data-pill-label]")
        .allTextContents()
    ).toEqual(["Action:", "Status:", "Amount:", "Currency:", "Created:"]);
  });

  test("clearing a pill does not take it off the row", async ({ page }) => {
    await openPayments(page);

    // Set from the drawer, so the pill is showing only because it holds a
    // value — the case where clearing could pull the control out from under
    // the cursor.
    await page.setViewportSize({ height: 900, width: 375 });
    await page.getByRole("button", { name: DRAWER_TRIGGER }).click();
    await page.getByRole("button", { name: ROW_PROVIDER }).click();
    await page.getByRole("radio", { name: "Stripe" }).click();
    await page.keyboard.press("Escape");
    await page.setViewportSize({ height: 900, width: 1280 });

    expect(await pills(page)).toContain("Provider: Stripe");

    await pill(page, "Provider").click();
    await page
      .locator('[data-slot="dropdown-menu-content"]')
      .getByRole("menuitemradio", { name: "All" })
      .click();

    expect(await pills(page)).toContain("Provider: All");
  });

  test("an empty filter offers options and nothing to clear", async ({
    page,
  }) => {
    await openPayments(page);

    await addFilter(page, "Currency");
    await pill(page, "Currency").click();

    // No clear control while the filter holds nothing: a button that would
    // do nothing is one more thing to read past to reach the options.
    await expect(popover(page).getByRole("option")).toHaveCount(4);
    await expect(
      popover(page).getByRole("button", { name: "Clear currencies" })
    ).toHaveCount(0);
  });

  test("the add-filter menu never offers a pill already on the row", async ({
    page,
  }) => {
    await openPayments(page);

    await page.getByRole("button", { name: ADD_FILTER }).click();
    // `allTextContents()` is a one-shot read with no auto-waiting, so wait
    // for the popup first or the read can land mid-animation and come back
    // empty.
    await expect(
      page.locator('[data-slot="dropdown-menu-content"]')
    ).toBeVisible();
    expect(await page.getByRole("menuitem").allTextContents()).toEqual([
      "Currency",
      "Provider",
      "Player",
      "Created",
      "Amount",
    ]);
    await closeMenu(page);

    await addFilter(page, "Currency");
    await page.getByRole("button", { name: ADD_FILTER }).click();
    await expect(
      page.locator('[data-slot="dropdown-menu-content"]')
    ).toBeVisible();
    expect(await page.getByRole("menuitem").allTextContents()).not.toContain(
      "Currency"
    );
    await closeMenu(page);

    // With every filter shown there is nothing left to add, so the control
    // goes rather than opening onto an empty menu.
    for (const label of ["Provider", "Player", "Created", "Amount"]) {
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
    await popover(page).getByRole("option", { name: "BTC" }).click();
    await popover(page).getByRole("option", { name: "ETH" }).click();

    // Picked options become chips and stay in the list, marked: the popover
    // spells out in full what the pill abbreviates, and nothing moves under
    // the pointer between picks.
    await expect(popover(page).getByRole("option")).toHaveCount(4);
    await expect(
      popover(page).getByRole("option", { selected: true })
    ).toHaveText(["BTC", "ETH"]);

    // Clicking a picked option again unpicks it.
    await popover(page).getByRole("option", { name: "ETH" }).click();
    await expect(
      popover(page).getByRole("option", { selected: true })
    ).toHaveText(["BTC"]);
    await popover(page).getByRole("option", { name: "ETH" }).click();
    await closePopover(page);

    // "2" alone would say how many without saying which.
    expect(await pills(page)).toContain("Currency: BTC, +1");

    await pill(page, "Currency").click();
    await popover(page)
      .getByRole("button", { name: "Clear currencies" })
      .click();
    await closePopover(page);

    expect(await pills(page)).toContain("Currency: All");
  });

  test("columns sort from their headers, not from a filter pill", async ({
    page,
  }) => {
    await openPayments(page);

    // Sorting is not filtering, so it is never one of the pills.
    expect((await pills(page)).some((label) => label.startsWith("Sort"))).toBe(
      false
    );

    const amounts = () => rawAmounts(page);

    await page.getByRole("button", { name: "Amount", exact: true }).click();
    const descending = (await amounts()).map(Number);
    expect(descending).toEqual([...descending].sort((a, b) => b - a));

    await page.getByRole("button", { name: "Amount", exact: true }).click();
    const ascending = (await amounts()).map(Number);
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));

    // Only the columns that actually sort claim to. `aria-sort="none"` is the
    // correct value for a sortable column that is not the active one — the
    // wrong thing would be putting it on the three that do nothing, which is a
    // promise the table cannot keep.
    const sortStates = await page
      .locator('[data-slot="table-head"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("aria-sort")));

    expect(sortStates.filter(Boolean)).toHaveLength(5);
    expect(sortStates.filter((state) => state && state !== "none")).toEqual([
      "ascending",
    ]);
  });

  test("the Sort menu and the headers drive one sort", async ({ page }) => {
    await openPayments(page);
    const trigger = page.getByRole("button", { name: SORT_TRIGGER });
    await expect(trigger).toHaveText("Sort:Created(Newest first)");

    // Picking a column takes its natural direction, and the direction list
    // speaks that column's language rather than "ascending".
    await trigger.click();
    await page.getByRole("menuitemradio", { name: "Finished" }).click();
    await expect(trigger).toHaveText("Sort:Finished(Newest first)");
    await trigger.click();
    await expect(
      page.getByRole("menuitemradio", { name: "Newest first" })
    ).toHaveAttribute("aria-checked", "true");
    await page.getByRole("menuitemradio", { name: "Player" }).click();
    await expect(trigger).toHaveText("Sort:Player(A–Z)");

    // A header click lands on the same state, so the menu follows it.
    await page.getByRole("button", { name: "Amount", exact: true }).click();
    await expect(trigger).toHaveText("Sort:Amount(Largest first)");
  });

  test("the summary counts the rows on screen, not the pages", async ({
    page,
  }) => {
    await openPayments(page);
    // The footer's info slot — where the sibling table puts its selection
    // count, and the same question asked of a table without selection.
    const summary = page.locator('[data-slot="table-pagination-info"]');

    await expect(summary).toHaveText("Showing 1–10 of 18 payments");

    await page.getByRole("button", { name: NEXT_PAGE }).click();
    // The last page is short, which is the case a page counter cannot express
    // — `Page 2 of 2` says nothing about holding eight rows rather than ten.
    await expect(summary).toHaveText("Showing 11–18 of 18 payments");

    await pill(page, "Status").click();
    await page
      .locator('[data-slot="dropdown-menu-content"]')
      .getByRole("menuitemradio", { name: "Failed" })
      .click();
    await expect(summary).toHaveText("Showing 1–5 of 5 payments");

    // The empty row already says nothing matched; a summary reading "0 of 0"
    // under it would only repeat that less gracefully.
    await page.getByLabel("Search payments by email").fill("zzzznomatch");
    await expect(summary).toHaveText("");

    // It sits on the footer's baseline, beside the page-size control rather
    // than above the table.
    const aligned = await page.evaluate(() => {
      const mid = (selector: string) => {
        const box = document.querySelector(selector)?.getBoundingClientRect();
        return box ? box.top + box.height / 2 : Number.NaN;
      };
      return (
        Math.abs(
          mid('[data-slot="table-pagination-info"]') -
            mid('[data-slot="table-pagination-page-size"]')
        ) < 1
      );
    });
    expect(aligned).toBe(true);
  });

  test("every row carries its actions in a menu, not on hover", async ({
    page,
  }) => {
    await openPayments(page);

    // A hover-revealed button is unreachable on touch, and this table is the
    // one most likely to be read on a phone. The menu is there without
    // hovering, for every row.
    const triggers = page.getByRole("button", { name: ROW_ACTIONS });
    expect(await triggers.count()).toBe(10);
    await expect(triggers.first()).toBeVisible();

    await triggers.first().click();
    // `allTextContents()` is a one-shot read with no auto-waiting, so it can
    // land while the popup is still animating open and come back empty.
    await expect(
      page.locator('[data-slot="dropdown-menu-content"]')
    ).toBeVisible();
    expect(await page.getByRole("menuitem").allTextContents()).toEqual([
      "View details",
      "Copy payment ID",
    ]);
  });

  test("a search that matches nothing offers the way back", async ({
    page,
  }) => {
    await openPayments(page);
    const total = await rowCount(page);

    await page.getByLabel("Search payments by email").fill("no-such-player");
    await expect(
      page.getByText("No payments match these filters")
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByLabel("Search payments by email")).toHaveValue("");
    expect(await rowCount(page)).toBe(total);
  });

  test("Export downloads every filtered row, not just the page", async ({
    page,
  }) => {
    await openPayments(page);
    const summary = await page
      .locator('[data-slot="table-pagination-info"]')
      .textContent();
    const total = Number(summary?.match(SUMMARY_TOTAL)?.[1]);
    expect(total).toBeGreaterThan(await rowCount(page));

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("payments.csv");
    const path = await download.path();
    const csv = readFileSync(path, "utf8").trim().split("\r\n");
    // A header plus one line per payment.
    expect(csv).toHaveLength(total + 1);
  });

  test("amounts are grouped and carry their currency's precision", async ({
    page,
  }) => {
    await openPayments(page);
    await settled(page);
    const firstRow = page.locator('[data-slot="table-body"] tr').first();
    // The fixture's first row is 10000.000000 USDT.
    await expect(firstRow.locator("[data-amount]")).toHaveText("10,000.00");
  });

  test("a payment opens its record from the id and from the row menu", async ({
    page,
  }) => {
    await openPayments(page);
    const drawer = page.locator('[data-slot="drawer-content"]');
    const fullId = "4b87f2e4-7cf0-4c37-b21f-4dc4d91a7235";

    await page.getByRole("button", { exact: true, name: "4b8...235" }).click();
    await expect(drawer).toBeVisible();
    // The table shows the id cut down; the record is where the whole of it is.
    await expect(drawer).toContainText(fullId);
    await expect(drawer).toContainText("10,000.00 USDT");
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();

    await page.getByRole("button", { name: ROW_ACTIONS }).first().click();
    await page.getByRole("menuitem", { name: "View details" }).click();
    await expect(drawer).toContainText(fullId);
  });

  test("the actions trigger names the row it belongs to", async ({ page }) => {
    await openPayments(page);

    // Ten identical "Actions" buttons would leave a screen reader to work out
    // which row it is on from context it does not have.
    const names = await page
      .getByRole("button", { name: ROW_ACTIONS })
      .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim()));

    expect(new Set(names).size).toBe(names.length);
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

/**
 * Run in dark mode on purpose. Emphasis that survives one theme and not the
 * other is a recurring failure here — a plain `border-ring` was silently dead
 * in dark because `Button`'s outline variant carries `dark:border-input` at a
 * higher specificity — so the check runs where the paint is hardest to get
 * right.
 */
test.describe("an applied pill reads differently from an unset one", () => {
  test.use({ colorScheme: "dark" });

  test("states its value at full strength, its placeholder muted", async ({
    page,
  }) => {
    await openPayments(page);

    await pill(page, "Status").click();
    await page
      .locator('[data-slot="dropdown-menu-content"]')
      .getByRole("menuitemradio", { name: "Failed" })
      .click();
    // Somewhere else, so nothing is left focused.
    await page.getByLabel("Search payments by email").click();

    const states = await page
      .locator("[data-filter-pill]")
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          applied: Boolean(node.getAttribute("data-active")),
          border: getComputedStyle(node).borderColor,
          value: getComputedStyle(
            node.querySelector("[data-pill-value]") as Element
          ).color,
        }))
      );

    const applied = states.filter((s) => s.applied);
    const unset = states.filter((s) => !s.applied);
    expect(applied).toHaveLength(1);
    expect(unset.length).toBeGreaterThan(0);

    // The value carries the distinction.
    expect(applied[0].value).not.toBe(unset[0].value);

    // The border does not. Anything bright enough to scan a row of pills for
    // reads as focus — a control claiming the keyboard is on it.
    expect(applied[0].border).toBe(unset[0].border);
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
      "Sort Created (Newest first)",
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

test.describe("adding a filter", () => {
  test("opens the new pill straight away", async ({ page }) => {
    await openPayments(page);

    // A menu-backed pill: its options are on screen without a second click.
    await page.getByRole("button", { name: ADD_FILTER }).click();
    await page.getByRole("menuitem", { exact: true, name: "Provider" }).click();
    await expect(
      page.getByRole("menuitemradio", { name: "Stripe" })
    ).toBeVisible();
    await page.getByRole("menuitemradio", { name: "Stripe" }).click();
    expect(await pills(page)).toContain("Provider: Stripe");

    // An operator chip: its popover opens and holds focus, rather than focus
    // being handed back to `Add filter` behind it.
    await page.getByRole("button", { name: ADD_FILTER }).click();
    await page.getByRole("menuitem", { exact: true, name: "Currency" }).click();
    await expect(popover(page)).toBeVisible();
    await expect(popover(page).locator(":focus")).toHaveCount(1);
  });

  test("Escape on the add menu still returns focus to it", async ({ page }) => {
    await openPayments(page);
    const add = page.getByRole("button", { name: ADD_FILTER });

    await add.click();
    await expect(
      page.locator('[data-slot="dropdown-menu-content"]')
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await expect(add).toBeFocused();
  });
});

test.describe("removing a filter", () => {
  test("a simple pill swaps its chevron for an X without changing width", async ({
    page,
  }) => {
    await openPayments(page);
    await addFilter(page, "Provider");
    const provider = pill(page, "Provider");
    const x = page.getByRole("button", { name: "Remove Provider filter" });

    const before = await provider.boundingBox();
    await provider.hover();
    await expect(x).toHaveCSS("opacity", "1");
    await expect(provider.locator("svg").last()).toHaveCSS("opacity", "0");
    expect((await provider.boundingBox())?.width).toBe(before?.width);

    // One tab stop per pill: the X is reached by pointer, Backspace by keyboard.
    await expect(x).toHaveAttribute("tabindex", "-1");
  });

  test("the X takes an added pill off the row and moves focus along", async ({
    page,
  }) => {
    await openPayments(page);
    await addFilter(page, "Provider");
    await addFilter(page, "Currency");

    await pill(page, "Provider").hover();
    await page.getByRole("button", { name: "Remove Provider filter" }).click();

    await expect(pill(page, "Provider")).toHaveCount(0);
    // The X click must not also open the pill's menu.
    await expect(
      page.locator('[data-slot="dropdown-menu-content"]')
    ).toHaveCount(0);
    await expect(pill(page, "Currency")).toBeFocused();
  });

  test("a starting pill comes off like any other, and Clear all brings it back", async ({
    page,
  }) => {
    await openPayments(page);
    const total = await rowCount(page);

    // Holding a value: the X clears it and takes the pill off the row.
    await pill(page, "Status").click();
    await page.getByRole("menuitemradio", { name: "Failed" }).click();
    await pill(page, "Status").hover();
    await page.getByRole("button", { name: "Remove Status filter" }).click();

    expect(await pills(page)).toEqual(["Action: All"]);
    expect(await rowCount(page)).toBe(total);

    // Reading "All": same X, same result.
    await pill(page, "Action").hover();
    await page.getByRole("button", { name: "Remove Action filter" }).click();
    expect(await pills(page)).toEqual([]);

    // Both are back on offer, and Clear all restores the starting row.
    await addFilter(page, "Status");
    await pill(page, "Status").click();
    await page.getByRole("menuitemradio", { name: "Failed" }).click();
    await page.getByRole("button", { name: "Clear all" }).click();
    expect(await pills(page)).toEqual(["Action: All", "Status: All"]);
  });

  test("Backspace on a focused pill removes it", async ({ page }) => {
    await openPayments(page);
    await addFilter(page, "Provider");

    await pill(page, "Provider").focus();
    await page.keyboard.press("Backspace");

    await expect(pill(page, "Provider")).toHaveCount(0);
    // Past the last pill, focus lands on the control the filter went back to.
    await expect(page.getByRole("button", { name: ADD_FILTER })).toBeFocused();
  });

  test("an operator chip takes the same X as every other pill", async ({
    page,
  }) => {
    await openPayments(page);
    await addFilter(page, "Currency");
    await addFilter(page, "Provider");

    await pill(page, "Currency").hover();
    await page.getByRole("button", { name: "Remove Currency filter" }).click();

    await expect(pill(page, "Currency")).toHaveCount(0);
    await expect(pill(page, "Provider")).toBeFocused();
  });

  test("an operator chip can also be removed from its ⋯ menu", async ({
    page,
  }) => {
    await openPayments(page);
    await addFilter(page, "Currency");
    await addFilter(page, "Provider");
    const currency = pill(page, "Currency");

    await currency.click();
    await popover(page).getByRole("option", { name: "BTC" }).click();
    await popover(page).getByRole("button", { name: "More actions" }).click();
    // Clicked over the popover: the nested menu has to stack above it.
    await page.getByRole("menuitem", { name: "Delete filter" }).click();

    await expect(currency).toHaveCount(0);
    await expect(popover(page)).toHaveCount(0);
    await expect(pill(page, "Provider")).toBeFocused();

    // Re-added, it starts from nothing — operator included.
    await addFilter(page, "Currency");
    expect(await pills(page)).toContain("Currency: All");
  });
});

test.describe("operator filters", () => {
  test("is not excludes, and says so on the chip", async ({ page }) => {
    await openPayments(page);
    await addFilter(page, "Currency");

    await pill(page, "Currency").click();
    await popover(page).getByRole("option", { name: "USDT" }).click();
    const only = await rowCount(page);

    await popover(page).getByRole("button", { name: OPERATOR }).click();
    await page.getByRole("menuitemradio", { name: "Is not" }).click();
    await closePopover(page);

    expect(await pills(page)).toContain("Currency is not: USDT");
    await settled(page);
    const cells = await page
      .locator('[data-slot="table-body"] td[data-column="currency"]')
      .allTextContents();
    expect(cells).not.toContain("USDT");
    expect(only).toBeGreaterThan(0);
  });

  test("switching the amount operator drops the bound it no longer reads", async ({
    page,
  }) => {
    await openPayments(page);
    await addFilter(page, "Amount");

    await pill(page, "Amount").click();
    await popover(page).getByLabel("Min").fill("1");
    await popover(page).getByLabel("Max").fill("500");
    await popover(page).getByRole("button", { name: OPERATOR }).click();
    await page.getByRole("menuitemradio", { name: "Greater than" }).click();
    await closePopover(page);

    // "> 1" — not "> 1" with a hidden ceiling of 500 still narrowing the rows.
    expect(await pills(page)).toContain("Amount: > 1");
    const amounts = (await rawAmounts(page)).map(Number);
    expect(amounts.every((value) => value > 1)).toBe(true);
    expect(amounts.some((value) => value > 500)).toBe(true);
  });

  test("the phone drawer shows the operator", async ({ page }) => {
    await openPayments(page);
    await addFilter(page, "Currency");
    await pill(page, "Currency").click();
    await popover(page).getByRole("option", { name: "BTC" }).click();
    await popover(page).getByRole("button", { name: OPERATOR }).click();
    await page.getByRole("menuitemradio", { name: "Is not" }).click();
    await closePopover(page);

    await page.setViewportSize({ height: 900, width: 375 });
    await page.getByRole("button", { name: DRAWER_TRIGGER }).click();
    expect(await drawerRows(page)).toContain("Currency is not BTC");
  });
});

test.describe("text operators", () => {
  test("a player filter narrows by substring, and inverts", async ({
    page,
  }) => {
    await openPayments(page);
    const emails = async () => {
      await settled(page);
      return page
        .locator('[data-slot="table-body"] td[data-column="playerEmail"]')
        .allTextContents();
    };

    await page.getByRole("button", { name: ADD_FILTER }).click();
    await page.getByRole("menuitem", { exact: true, name: "Player" }).click();
    // Opened straight into its field, so typing is the next keystroke.
    await expect(popover(page).getByLabel("Player email")).toBeFocused();
    await page.keyboard.type("GMAIL");

    // Case-insensitive, and "contains" goes unsaid on the chip.
    expect(await pills(page)).toContain("Player: GMAIL");
    expect((await emails()).every((email) => email.includes("gmail"))).toBe(
      true
    );

    await popover(page).getByRole("button", { name: OPERATOR }).click();
    await page.getByRole("menuitemradio", { name: "Does not contain" }).click();
    await closePopover(page);

    expect(await pills(page)).toContain("Player does not contain: GMAIL");
    expect((await emails()).some((email) => email.includes("gmail"))).toBe(
      false
    );
  });
});

test.describe("removing a filter on a touch screen", () => {
  // A tablet: wide enough for the pill row, but no hover, so no X.
  test.use({ hasTouch: true, viewport: { height: 900, width: 1024 } });

  test("the pill's menu carries a Delete filter row instead", async ({
    page,
  }) => {
    await openPayments(page);
    const hoverless = await page.evaluate(
      () => matchMedia("(hover: none)").matches
    );
    test.skip(!hoverless, "this browser still reports hover with touch on");

    await addFilter(page, "Provider");
    await pill(page, "Provider").click();
    await page.getByRole("menuitem", { name: "Delete filter" }).click();
    await expect(pill(page, "Provider")).toHaveCount(0);

    // The starting pills carry it too.
    await pill(page, "Status").click();
    await page.getByRole("menuitem", { name: "Delete filter" }).click();
    await expect(pill(page, "Status")).toHaveCount(0);
  });
});

test.describe("payments view controls", () => {
  test("a hidden column leaves the header and every row", async ({ page }) => {
    await openPayments(page);
    const currencyHeader = page.getByRole("columnheader", { name: "Currency" });
    await expect(currencyHeader).toBeVisible();

    await page.getByRole("button", { name: "Columns" }).click();
    await page.getByRole("menuitemcheckbox", { name: "Currency" }).click();
    // Checkbox items keep the menu open, so several can go in one visit.
    await expect(
      page.getByRole("menuitemcheckbox", { name: "Currency" })
    ).toHaveAttribute("aria-checked", "false");
    await closeMenu(page);

    await expect(currencyHeader).toHaveCount(0);
    await expect(page.locator('td[data-column="currency"]')).toHaveCount(0);
  });

  test("a selection survives paging and exports only what was ticked", async ({
    page,
  }) => {
    await openPayments(page);
    await page
      .getByRole("checkbox", { name: "Select all payments on this page" })
      .click();
    await page.getByRole("button", { name: NEXT_PAGE }).click();
    await settled(page);
    await page
      .locator('[data-slot="table-body"] [role="checkbox"]')
      .first()
      .click();

    const bar = page.locator('[data-slot="selection-bar"]');
    await expect(bar).toContainText("11 payments selected");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      bar.getByRole("button", { name: "Export" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("payments-selected.csv");
    const csv = readFileSync(await download.path(), "utf8")
      .trim()
      .split("\r\n");
    expect(csv).toHaveLength(12);
  });

  test("a change shows skeleton rows, then the answer", async ({ page }) => {
    await openPayments(page);
    await page.getByRole("button", { exact: true, name: "Amount" }).click();

    // Busy, with placeholders at the real rows' height so nothing jumps.
    const table = page.locator('[data-slot="table"]');
    await expect(table).toHaveAttribute("aria-busy", "true");
    const skeleton = page.locator("[data-skeleton-row]");
    await expect(skeleton.first()).toBeVisible();
    const height = await skeleton
      .first()
      .evaluate((row) => row.getBoundingClientRect().height);
    expect(Math.round(height)).toBe(49);

    await settled(page);
    await expect(skeleton).toHaveCount(0);
  });

  test("the URL carries the view, and a reload lands on it", async ({
    page,
  }) => {
    await openPayments(page);
    await page.getByRole("button", { name: ACTION_PILL_TRIGGER }).click();
    await page.getByRole("menuitemradio", { name: "Cashout" }).click();
    await page.getByRole("button", { exact: true, name: "Amount" }).click();
    await settled(page);

    await expect(page).toHaveURL(URL_VIEW);
    await expect(page).toHaveURL(URL_TYPE);
    await expect(page).toHaveURL(URL_SORT);

    await page.reload();
    await settled(page);
    await expect(page.getByLabel("Search payments by email")).toBeVisible();
    expect(await pills(page)).toContain("Action: Cashout");
    await expect(page.getByRole("button", { name: SORT_TRIGGER })).toHaveText(
      "Sort:Amount(Largest first)"
    );
  });

  test("a link with values it cannot use opens the table unfiltered", async ({
    page,
  }) => {
    await gotoPreview(
      page,
      "block-admin-01",
      "?view=payments&status=bogus&sort=nope.sideways&page=-3"
    );
    await settled(page);
    expect(await pills(page)).toContain("Status: All");
    await expect(page.getByRole("button", { name: SORT_TRIGGER })).toHaveText(
      "Sort:Created(Newest first)"
    );
    expect(await rowCount(page)).toBe(10);
  });
});
