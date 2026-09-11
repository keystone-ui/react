import { expect, type Page, test } from "@playwright/test";

/**
 * `admin-01`'s filter parity with `tickets-01`, desktop and mobile.
 *
 * `menu-dismissal.spec.ts` covers the desktop menus, because those exist to pin
 * the `closeOnClick` default. This file covers what is specific to this block:
 * the mobile drawer, and the fact that its Sort control and the table headers
 * write the same piece of state.
 */

const FILTERS_TRIGGER = /Filters/;
const SIDEBAR_TRIGGER = /Toggle Sidebar/i;
const ROLE_TRIGGER = /All roles/;
const ROLE_ROW = /^Role/;
const STATUS_ROW = /^Status/;
const USER_COLUMN = /User/;
const SEATS_COLUMN = /Seats/;
const SORT_ASC_LABEL = /Name A–Z/;
const SORT_DESC_LABEL = /Name Z–A/;
const SORT_SEATS_LABEL = /Seats, most first/;
const CLEAR_BUTTON = /^Clear/;

const rowCount = (page: Page) =>
  page.locator('[data-slot="table-body"] tr').count();

/**
 * Below `md` the sidebar is a drawer, so the Users nav item has to be revealed
 * and then the nav dismissed before the table underneath is reachable.
 */
async function openUsers(page: Page) {
  await page.goto("/preview/block-admin-01");
  const users = page.getByRole("button", { name: "Users" });
  if (await users.isVisible()) {
    await users.click();
  } else {
    await page.getByRole("button", { name: SIDEBAR_TRIGGER }).click();
    await expect(users).toBeVisible();
    await users.click();
    await page.keyboard.press("Escape");
  }
  await expect(page.getByLabel("Search users")).toBeVisible();
}

test.describe("mobile filters drawer", () => {
  test.use({ viewport: { width: 375, height: 900 } });

  test("collapses the filter cluster into one trigger", async ({ page }) => {
    await openUsers(page);

    // Search stays; everything else folds into Filters. Nothing wraps onto a
    // second line, which is what this block did before the drawer existed.
    await expect(page.getByLabel("Search users")).toBeVisible();
    await expect(
      page.getByRole("button", { name: FILTERS_TRIGGER })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: ROLE_TRIGGER })).toBeHidden();
  });

  test("drills into a filter and applies it", async ({ page }) => {
    await openUsers(page);
    const total = await rowCount(page);

    await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
    const drawer = page.locator('[data-slot="drawer-content"]');
    await expect(drawer.getByText("Filters")).toBeVisible();

    // Step 0 is a menu of label + current value rows.
    await drawer.getByRole("button", { name: ROLE_ROW }).click();
    // The Stepper keeps the outgoing step mounted while it slides, so assert
    // on the step's own content rather than counting titles.
    await expect(drawer.getByRole("button", { name: "Back" })).toBeVisible();
    await expect(
      drawer.getByRole("radio", { name: "All roles" })
    ).toBeVisible();

    await drawer.getByText("Viewer", { exact: true }).click();
    expect(await rowCount(page)).toBeLessThan(total);

    // Back returns to the menu, which now shows the picked value.
    await drawer.getByRole("button", { name: "Back" }).click();
    await expect(drawer.getByRole("button", { name: ROLE_ROW })).toContainText(
      "Viewer"
    );
  });

  test("surfaces the active count and can clear from inside", async ({
    page,
  }) => {
    await openUsers(page);
    const total = await rowCount(page);

    await page.getByLabel("Search users").fill("a");
    await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
    const drawer = page.locator('[data-slot="drawer-content"]');
    await drawer.getByRole("button", { name: STATUS_ROW }).click();
    await drawer.getByText("Active", { exact: true }).click();
    await drawer.getByRole("button", { name: "Back" }).click();

    // The desktop `Clear N` is hidden at this width, so the count rides on the
    // trigger and the reset lives in the drawer footer.
    await drawer.getByRole("button", { name: "Clear all" }).click();

    expect(await rowCount(page)).toBe(total);
    await expect(drawer.getByRole("button", { name: "Clear all" })).toHaveCount(
      0
    );
  });
});

test.describe("sort is one piece of state", () => {
  test("a header click updates the toolbar's Sort label", async ({ page }) => {
    await openUsers(page);

    const sortTrigger = page.getByRole("button", { name: SORT_ASC_LABEL });
    await expect(sortTrigger).toBeVisible();

    // Cycling the Name header to descending must move the toolbar with it. If
    // these were two systems, the label would still read "Name A–Z".
    await page
      .getByRole("columnheader", { name: USER_COLUMN })
      .getByRole("button")
      .click();

    await expect(
      page.getByRole("button", { name: SORT_DESC_LABEL })
    ).toBeVisible();
  });

  test("picking in the toolbar moves the header's aria-sort", async ({
    page,
  }) => {
    await openUsers(page);

    await page.getByRole("button", { name: SORT_ASC_LABEL }).click();
    await page
      .getByRole("menuitemradio", { name: "Seats, most first" })
      .click();

    const seats = page.getByRole("columnheader", { name: SEATS_COLUMN });
    await expect(seats).toHaveAttribute("aria-sort", "descending");
  });
});

test("Clear resets the filters and leaves the sort alone", async ({ page }) => {
  await openUsers(page);

  // Sort is not a filter, so it is excluded from the active count and Clear
  // must not touch it. Without this, clearing a search would silently reorder
  // the table under the reader.
  await page.getByRole("button", { name: SORT_ASC_LABEL }).click();
  await page.getByRole("menuitemradio", { name: "Seats, most first" }).click();

  // A term narrow enough to drop below the 5-row page size, so the count is a
  // real signal rather than the pagination window.
  const total = await rowCount(page);
  await page.getByLabel("Search users").fill("Ada");
  expect(await rowCount(page)).toBeLessThan(total);

  await page.getByRole("button", { name: CLEAR_BUTTON }).click();

  expect(await rowCount(page)).toBe(total);
  await expect(
    page.getByRole("button", { name: SORT_SEATS_LABEL })
  ).toBeVisible();
});
