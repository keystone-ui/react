import { expect, test } from "@playwright/test";

const NEXT_PAGE = /next page/i;
const ROW_ACTIONS = /^Actions for ticket/;

/**
 * The footer says how much of the result set is on screen.
 *
 * It used to say "N of M row(s) selected", which the `SelectionBar` already
 * says — and says at every width, where this slot is `hidden lg:block`. So
 * the footer was spending its one line repeating something better stated
 * elsewhere, and stating nothing about the size of the result set.
 */
test.describe("tickets pagination footer", () => {
  const INFO = '[data-slot="table-pagination-info"]';

  test("counts the rows on screen, and leaves selection to the bar", async ({
    page,
  }) => {
    await page.goto("/preview/block-tickets-01");
    const info = page.locator(INFO);

    await expect(info).toHaveText("Showing 1–10 of 20 tickets");

    // Selecting a row must not change it: that count has its own home.
    await page
      .locator('[data-slot="table-body"] [role="checkbox"]')
      .first()
      .click();
    await expect(page.locator('[data-slot="selection-bar"]')).toContainText(
      "1 ticket selected"
    );
    await expect(info).toHaveText("Showing 1–10 of 20 tickets");
  });

  test("reports the short last page, which a page counter cannot", async ({
    page,
  }) => {
    await page.goto("/preview/block-tickets-01");
    const info = page.locator(INFO);

    await page.getByRole("button", { name: NEXT_PAGE }).first().click();

    // `Page 2 of 2` reads the same whether this page holds ten rows or three.
    await expect(info).toHaveText("Showing 11–20 of 20 tickets");
  });
});

/**
 * Every value-bearing control names its own dimension.
 *
 * A toolbar reading "Manual" beside "All Statuses" has one control naming a
 * value with no dimension and the next naming a dimension with no value.
 * `admin-01` states the same pair as `Sort: Manual` and `Status: All`.
 */
test.describe("tickets toolbar labels", () => {
  test("labels the filters, and leaves the menu name alone", async ({
    page,
  }) => {
    await page.goto("/preview/block-tickets-01");

    const triggers = await page
      .locator('[data-slot="dropdown-menu-trigger"]')
      .evaluateAll((nodes) =>
        nodes.slice(0, 3).map((node) => {
          const label = node.querySelector("span.text-muted-foreground");
          const all = node.textContent?.trim() ?? "";
          return label
            ? `${label.textContent?.trim()} ${all.slice((label.textContent ?? "").length).trim()}`
            : all;
        })
      );

    // "Table options" keeps no label: it names a menu, not a value.
    expect(triggers).toEqual(["Sort: Manual", "Table options", "Status: All"]);
  });
});

/**
 * Row actions are in a trailing menu, not revealed on hover.
 *
 * The button they replace also sat inside the Subject cell, which owns an
 * inline editor — one click started an edit, a click two pixels right opened
 * the drawer.
 */
test.describe("tickets row actions", () => {
  test("are present without hovering, on every row", async ({ page }) => {
    await page.goto("/preview/block-tickets-01");

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
      "Copy ticket ID",
    ]);
  });

  test("name the row they belong to", async ({ page }) => {
    await page.goto("/preview/block-tickets-01");

    const names = await page
      .getByRole("button", { name: ROW_ACTIONS })
      .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim()));

    expect(new Set(names).size).toBe(names.length);
  });

  test("leave header, body and footer the same width", async ({ page }) => {
    await page.goto("/preview/block-tickets-01");

    // A summary row one cell short of the header pulls every column after it
    // out of alignment, and the empty state's colSpan has to grow with it.
    const counts = await page.evaluate(() => ({
      body: document.querySelector('[data-slot="table-body"] tr')?.children
        .length,
      foot: document.querySelector('[data-slot="table-footer"] tr')?.children
        .length,
      head: document.querySelector('[data-slot="table-header"] tr')?.children
        .length,
    }));

    expect(counts.body).toBe(counts.head);
    expect(counts.foot).toBe(counts.head);
  });
});
