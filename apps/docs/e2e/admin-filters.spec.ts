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
const ROLE_TRIGGER = /^Role:/;
const ROW_ACTIONS = /^Actions for /;
const ROLE_ROW = /^Role/;
const STATUS_ROW = /^Status/;
const USER_COLUMN = /User/;
const SEATS_COLUMN = /Seats/;
const SORT_ASC_LABEL = /Name A–Z/;
const SORT_DESC_LABEL = /Name Z–A/;
const SORT_SEATS_LABEL = /Seats, most first/;
const CLEAR_BUTTON = /^Clear/;
const USERS_CRUMB = /^Users$/;
const ID_COLUMN = /ID/;

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
      drawer.getByRole("radio", { name: "All", exact: true })
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

test.describe("user detail", () => {
  test("opens from the name and shows the record", async ({ page }) => {
    await openUsers(page);

    await page
      .getByRole("button", { exact: true, name: "Ada Okonkwo" })
      .click();

    // Three sections of stacked pairs, not a table and not a form.
    await expect(page.getByRole("heading", { name: "Identity" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Access" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
    await expect(page.getByText("usr_3f9a2c81", { exact: true })).toBeVisible();
  });

  test("renders a dash for a value the record does not have", async ({
    page,
  }) => {
    await openUsers(page);
    await page
      .getByRole("button", { exact: true, name: "Ada Okonkwo" })
      .click();

    // The founding account has no inviter. The row stays, so the grid keeps
    // its alignment and the reader is told "nothing" rather than left guessing.
    const invitedBy = page
      .locator('[data-slot="description-list-item"]')
      .filter({ hasText: "Invited by" });

    await expect(invitedBy).toContainText("-");
  });

  /**
   * The block sweep in `overflow.spec.ts` only ever sees the list: the detail
   * view is behind a click, so its layout is unguarded there. The header —
   * name, status badge and two labelled actions — is the part that does not
   * fit a phone.
   */
  test("does not overflow at any width", async ({ page }) => {
    for (const width of [375, 768, 1280]) {
      // biome-ignore lint/performance/noAwaitInLoops: one page, resized in turn
      await page.setViewportSize({ height: 900, width });
      // biome-ignore lint/performance/noAwaitInLoops: one page, resized in turn
      await openUsers(page);
      // biome-ignore lint/performance/noAwaitInLoops: sequential by nature
      await page
        .getByRole("button", { exact: true, name: "Ada Okonkwo" })
        .click();

      // biome-ignore lint/performance/noAwaitInLoops: sequential by nature
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );

      expect(overflow, `detail view at ${width}px`).toBeLessThanOrEqual(1);
    }
  });

  /**
   * `invitedBy` holds the inviter's id rather than their name, so the record
   * can link to them. A detail page that names another record it can already
   * open should not render it as dead text.
   */
  test("navigates from a record to the one that invited it", async ({
    page,
  }) => {
    await openUsers(page);
    await page
      .getByRole("button", { exact: true, name: "Bruno Salgado" })
      .click();

    const invitedBy = page
      .locator('[data-slot="description-list-item"]')
      .filter({ hasText: "Invited by" });
    await expect(invitedBy).toContainText("Ada Okonkwo");

    await invitedBy.getByRole("button").click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Ada Okonkwo" })
    ).toBeVisible();
  });

  test("breadcrumb names the record and walks back to the list", async ({
    page,
  }) => {
    await openUsers(page);
    await page
      .getByRole("button", { exact: true, name: "Ada Okonkwo" })
      .click();

    await expect(page.getByRole("link", { name: USERS_CRUMB })).toBeVisible();
    await page.getByRole("link", { name: USERS_CRUMB }).click();

    await expect(page.getByLabel("Search users")).toBeVisible();
  });

  /**
   * Leaving the section has to drop the open record. Without that, Billing and
   * back lands on whichever user was open before, which looks like the app
   * ignored the click.
   */
  test("leaving the section and returning lands on the list", async ({
    page,
  }) => {
    await openUsers(page);
    await page
      .getByRole("button", { exact: true, name: "Ada Okonkwo" })
      .click();
    await expect(page.getByRole("heading", { name: "Identity" })).toBeVisible();

    await page.getByRole("button", { name: "Billing" }).click();
    await page.getByRole("button", { name: "Users" }).click();

    await expect(page.getByLabel("Search users")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Identity" })).toHaveCount(
      0
    );
  });

  /**
   * Replaces a hover-revealed Open button. Hover is unreachable on touch —
   * `focus-visible` rescues a keyboard, not a finger — so the affordance is
   * simply present, and the name stays clickable for the one-click path.
   */
  test("every row opens from a menu that is always present", async ({
    page,
  }) => {
    await openUsers(page);

    const triggers = page.getByRole("button", { name: ROW_ACTIONS });
    expect(await triggers.count()).toBe(5);
    await expect(triggers.first()).toBeVisible();

    // Named per row: five identical "Actions" buttons would leave a screen
    // reader to work out which row it is on from context it does not have.
    const names = await triggers.evaluateAll((nodes) =>
      nodes.map((node) => node.textContent?.trim())
    );
    expect(new Set(names).size).toBe(names.length);

    await triggers.first().click();
    expect(await page.getByRole("menuitem").allTextContents()).toEqual([
      "View details",
      "Copy user ID",
    ]);
    await page.getByRole("menuitem", { name: "View details" }).click();

    await expect(
      page.getByRole("heading", { name: "Ada Okonkwo" })
    ).toBeVisible();
  });

  test("the ID column shows the real id and sorts", async ({ page }) => {
    await openUsers(page);

    const ids = () =>
      page
        .locator('[data-slot="table-body"] tr td:nth-child(2)')
        .allTextContents();

    // Scoped to the header: once sorted, the toolbar's Sort trigger also reads
    // "ID, first added".
    const idHeader = page
      .getByRole("columnheader", { name: ID_COLUMN })
      .getByRole("button");

    await idHeader.click();
    const ascending = await ids();

    await idHeader.click();
    const descending = await ids();

    // Asserted as a relationship rather than against fixture values, so
    // renaming an id in the mock does not break the test. Only the first page
    // is visible, so the two directions are compared to their own ordering
    // rather than to each other's ends.
    expect(ascending).toEqual([...ascending].sort());
    expect(descending).toEqual([...descending].sort().reverse());
    expect(descending[0]).not.toBe(ascending[0]);
  });
});
