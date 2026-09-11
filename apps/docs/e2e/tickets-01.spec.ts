import { expect, test } from "@playwright/test";

const NEXT_PAGE = /next page/i;

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
