import { expect, type Locator, type Page, test } from "@playwright/test";

import { gotoPreview, settled } from "./preview";

/**
 * `admin-01`'s users table, on the payments table's design.
 *
 * `admin-payments.spec.ts` pins the pill mechanics in depth — focus after
 * removal, operator chips, the X swap. This file pins what the users table
 * adds or does differently: its vocabulary on the same pills, its phone
 * drawer, its sort, and its record page.
 */

const FILTERS_TRIGGER = /Filters/;
const SIDEBAR_TRIGGER = /Toggle Sidebar/i;
const ROW_ACTIONS = /^Actions for /;
const ADD_FILTER = /Add filter/;
const ROLE_PILL = /^Role:/;
const ROLE_ROW = /^Role/;
const SEATS_ROW = /^Seats/;
const SORT_ROW = /^Sort/;
const USER_COLUMN = /User/;
const SEATS_COLUMN = /Seats/;
const SORT_ASC_LABEL = /Sort:\s*Name\s*\(A–Z\)/;
const SORT_DESC_LABEL = /Sort:\s*Name\s*\(Z–A\)/;
const SORT_TRIGGER = /^Sort:/;
const SORT_SEATS_LABEL = /Sort:\s*Seats\s*\(Most first\)/;
const USERS_CRUMB = /^Users$/;
const ID_COLUMN = /ID/;
const URL_VIEW = /view=users/;
const URL_ROLE = /role=Admin/;

/** Real rows only, once the request has answered — never the skeleton. */
async function rowCount(page: Page): Promise<number> {
  await settled(page);
  return page
    .locator('[data-slot="table-body"] tr:not([data-skeleton-row])')
    .count();
}

/** Every pill, read as "Label: value" the way a person would scan the row. */
function pills(page: Page): Promise<string[]> {
  return page.locator("[data-filter-pill]").evaluateAll((nodes) =>
    nodes.map((node) => {
      const all = node.textContent?.trim() ?? "";
      const label =
        node.querySelector("[data-pill-label]")?.textContent?.trim() ?? "";
      return label ? `${label} ${all.slice(label.length).trim()}` : all;
    })
  );
}

/** The drawer's drilldown rows, read as "Label value". */
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

/** On a phone: open the drawer, drill into one filter, pick, and come out. */
async function applyInDrawer(page: Page, row: RegExp, option: string) {
  const drawer = page.locator('[data-slot="drawer-content"]');
  await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: row }).click();
  await drawer.getByRole("radio", { exact: true, name: option }).click();
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
}

/**
 * Below `md` the sidebar is a drawer, so the Users nav item has to be revealed
 * and then the nav dismissed before the table underneath is reachable.
 */
async function openUsers(page: Page) {
  await gotoPreview(page, "block-admin-01");
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
  await settled(page);
}

/**
 * Open a menu and wait for its popup.
 *
 * `allTextContents()` is a one-shot read with no auto-waiting, so reading
 * straight after the click lands mid-animation and returns an empty array.
 */
async function openMenu(page: Page, trigger: Locator) {
  await trigger.click();
  await expect(
    page.locator('[data-slot="dropdown-menu-content"]')
  ).toBeVisible();
}

test.describe("filters are pills, as on payments", () => {
  test("the row starts with Role and Status; the rest are added", async ({
    page,
  }) => {
    await openUsers(page);
    expect(await pills(page)).toEqual(["Role: All", "Status: All"]);

    await openMenu(page, page.getByRole("button", { name: ADD_FILTER }));
    expect(await page.getByRole("menuitem").allTextContents()).toEqual([
      "Seats",
      "Two-factor",
      "Created",
    ]);
  });

  test("a pill narrows the table and reads what it holds", async ({ page }) => {
    await openUsers(page);
    const total = await rowCount(page);

    await page.getByRole("button", { name: ROLE_PILL }).click();
    await page.getByRole("menuitemradio", { name: "Viewer" }).click();

    expect(await pills(page)).toContain("Role: Viewer");
    expect(await rowCount(page)).toBeLessThan(total);
  });

  test("Clear all restores every row and the starting pills", async ({
    page,
  }) => {
    await openUsers(page);
    const total = await rowCount(page);

    await page.getByLabel("Search users").fill("a");
    await page.getByRole("button", { name: ROLE_PILL }).click();
    await page.getByRole("menuitemradio", { name: "Admin" }).click();
    expect(await rowCount(page)).toBeLessThan(total);

    await page.getByRole("button", { name: "Clear all" }).click();

    expect(await pills(page)).toEqual(["Role: All", "Status: All"]);
    await expect(page.getByLabel("Search users")).toHaveValue("");
    expect(await rowCount(page)).toBe(total);
  });
});

test.describe("on a phone the filters fold into a drawer", () => {
  test.use({ viewport: { height: 900, width: 375 } });

  test("it reaches every filter and the sort", async ({ page }) => {
    await openUsers(page);
    await expect(page.locator("[data-filter-pill]").first()).toBeHidden();

    await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
    expect(await drawerRows(page)).toEqual([
      "Role All",
      "Status All",
      "Seats All",
      "Two-factor All",
      "Created Any",
      "Sort Name (A–Z)",
    ]);
  });

  test("drills into a filter and applies it", async ({ page }) => {
    await openUsers(page);
    const total = await rowCount(page);

    await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
    const drawer = page.locator('[data-slot="drawer-content"]');
    await drawer.getByRole("button", { name: ROLE_ROW }).click();
    // The Stepper keeps the outgoing step mounted while it slides, so assert
    // on the step's own content rather than counting titles.
    await expect(drawer.getByRole("button", { name: "Back" })).toBeVisible();
    await drawer.getByText("Viewer", { exact: true }).click();
    expect(await rowCount(page)).toBeLessThan(total);

    await drawer.getByRole("button", { name: "Back" }).click();
    await expect(drawer.getByRole("button", { name: ROLE_ROW })).toContainText(
      "Viewer"
    );
  });

  test("the Filters count ignores sort", async ({ page }) => {
    await openUsers(page);
    const trigger = page.getByRole("button", { name: FILTERS_TRIGGER });
    await expect(trigger).toHaveText("Filters");

    await applyInDrawer(page, ROLE_ROW, "Admin");
    await applyInDrawer(page, SEATS_ROW, "One seat");
    await expect(trigger).toHaveText("Filters2");

    // Sort lives in the same drawer and is not a filter. A badge that ticks up
    // when you reorder a column is lying about what it counts.
    await applyInDrawer(page, SORT_ROW, "Seats");
    await expect(trigger).toHaveText("Filters2");
  });

  test("a filter set on the phone shows its pill on a desktop", async ({
    page,
  }) => {
    await openUsers(page);
    await applyInDrawer(page, SEATS_ROW, "One seat");

    // Seats is not one of the starting pills, but it holds a value, so it is
    // on the row — a filter that narrows the table is never invisible.
    await page.setViewportSize({ height: 900, width: 1280 });
    expect(await pills(page)).toContain("Seats: One seat");
  });
});

test.describe("sort is one piece of state", () => {
  test("a header click updates the toolbar's Sort label", async ({ page }) => {
    await openUsers(page);
    await expect(
      page.getByRole("button", { name: SORT_ASC_LABEL })
    ).toBeVisible();

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
    await page.getByRole("menuitemradio", { name: "Seats" }).click();

    const seats = page.getByRole("columnheader", { name: SEATS_COLUMN });
    await expect(seats).toHaveAttribute("aria-sort", "descending");
  });

  test("picks the column, then a direction named for it", async ({ page }) => {
    await openUsers(page);
    const trigger = page.getByRole("button", { name: SORT_TRIGGER });

    // Always sorted, like payments: five columns, then two directions.
    await openMenu(page, trigger);
    expect(await page.getByRole("menuitemradio").allTextContents()).toEqual([
      "Name",
      "Role",
      "Seats",
      "Last active",
      "ID",
      "A–Z",
      "Z–A",
    ]);

    // A column takes its natural direction, which the list puts first.
    await page.getByRole("menuitemradio", { name: "Seats" }).click();
    await expect(trigger).toContainText("Most first");
    await openMenu(page, trigger);
    expect(
      (await page.getByRole("menuitemradio").allTextContents()).slice(-2)
    ).toEqual(["Most first", "Fewest first"]);

    // Changing direction keeps the column.
    await page.getByRole("menuitemradio", { name: "Fewest first" }).click();
    await expect(
      page.getByRole("columnheader", { name: SEATS_COLUMN })
    ).toHaveAttribute("aria-sort", "ascending");
  });

  test("Clear all resets the filters and leaves the sort alone", async ({
    page,
  }) => {
    await openUsers(page);

    // Sort is not a filter, so Clear must not touch it. Without this, clearing
    // a search would silently reorder the table under the reader.
    await page.getByRole("button", { name: SORT_ASC_LABEL }).click();
    await page.getByRole("menuitemradio", { name: "Seats" }).click();

    const total = await rowCount(page);
    await page.getByLabel("Search users").fill("Ada");
    expect(await rowCount(page)).toBeLessThan(total);

    await page.getByRole("button", { name: "Clear all" }).click();

    expect(await rowCount(page)).toBe(total);
    await expect(
      page.getByRole("button", { name: SORT_SEATS_LABEL })
    ).toBeVisible();
  });
});

test.describe("users view controls", () => {
  test("a hidden column leaves the header and every row", async ({ page }) => {
    await openUsers(page);
    await page.getByRole("button", { name: "Columns" }).click();
    // The name is the row, so it is not offered.
    await expect(
      page.getByRole("menuitemcheckbox", { name: "User" })
    ).toHaveCount(0);
    await page.getByRole("menuitemcheckbox", { name: "Role" }).click();
    await page.keyboard.press("Escape");

    await expect(page.getByRole("columnheader", { name: "Role" })).toHaveCount(
      0
    );
    await expect(page.locator('td[data-column="role"]')).toHaveCount(0);
  });

  test("the URL carries the view, and a reload lands on it", async ({
    page,
  }) => {
    await openUsers(page);
    await page.getByRole("button", { name: ROLE_PILL }).click();
    await page.getByRole("menuitemradio", { name: "Admin" }).click();
    await settled(page);
    await expect(page).toHaveURL(URL_VIEW);
    await expect(page).toHaveURL(URL_ROLE);

    await page.reload();
    await settled(page);
    expect(await pills(page)).toContain("Role: Admin");
  });

  test("skeleton rows keep the two-line rows' height", async ({ page }) => {
    await openUsers(page);
    const real = await page
      .locator('[data-slot="table-body"] tr')
      .first()
      .evaluate((row) => row.getBoundingClientRect().height);

    await page.getByRole("button", { name: SORT_ASC_LABEL }).click();
    await page.getByRole("menuitemradio", { name: "Seats" }).click();
    const skeleton = page.locator("[data-skeleton-row]").first();
    await expect(skeleton).toBeVisible();
    const placeholder = await skeleton.evaluate(
      (row) => row.getBoundingClientRect().height
    );

    expect(Math.round(placeholder)).toBe(Math.round(real));
  });
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
      await openUsers(page);
      await page
        .getByRole("button", { exact: true, name: "Ada Okonkwo" })
        .click();

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
    // `allTextContents()` is a one-shot read with no auto-waiting, so it can
    // land while the popup is still animating open and come back empty.
    await expect(
      page.locator('[data-slot="dropdown-menu-content"]')
    ).toBeVisible();
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

    const ids = async () => {
      await settled(page);
      return page
        .locator('[data-slot="table-body"] td[data-column="id"]')
        .allTextContents();
    };

    // Scoped to the header: once sorted, the toolbar's Sort trigger also reads
    // "ID". The first click takes the column's natural direction — last added
    // first — and the second flips it.
    const idHeader = page
      .getByRole("columnheader", { name: ID_COLUMN })
      .getByRole("button");

    await idHeader.click();
    const descending = await ids();

    await idHeader.click();
    const ascending = await ids();

    // Asserted as a relationship rather than against fixture values, so
    // renaming an id in the mock does not break the test. Only the first page
    // is visible, so the two directions are compared to their own ordering
    // rather than to each other's ends.
    expect(ascending).toEqual([...ascending].sort());
    expect(descending).toEqual([...descending].sort().reverse());
    expect(descending[0]).not.toBe(ascending[0]);
  });
});
