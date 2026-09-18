import { expect, type Locator, type Page, test } from "@playwright/test";

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
const ROW_ACTIONS = /^Actions for /;
const ROLE_ROW = /^Role/;
const SEATS_ROW = /^Seats/;
const SORT_ROW = /^Sort/;
const TWO_FACTOR_ROW = /^Two-factor/;
const USER_COLUMN = /User/;
const SEATS_COLUMN = /Seats/;
const SORT_ASC_LABEL = /Sort:\s*Name\s*\(A–Z\)/;
const SORT_DESC_LABEL = /Sort:\s*Name\s*\(Z–A\)/;
const SORT_TRIGGER = /^Sort:/;
const SORT_SEATS_LABEL = /Sort:\s*Seats\s*\(Most first\)/;
const CLEAR_BUTTON = /^Clear/;
const USERS_CRUMB = /^Users$/;
const ID_COLUMN = /ID/;

const rowCount = (page: Page) =>
  page.locator('[data-slot="table-body"] tr').count();

/** Chips read as "Label: value" — composed, because the spans are adjacent. */
function chipLabels(page: Page): Promise<string[]> {
  return page.locator("[data-filter-chip]").evaluateAll((nodes) =>
    nodes.map((node) => {
      const label = node.querySelector("span")?.textContent?.trim() ?? "";
      const all = node.textContent?.trim() ?? "";
      return `${label} ${all.slice(label.length).trim()}`;
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

/** Open the drawer, drill into one filter, pick a value, and come back out. */
async function applyFilter(page: Page, row: RegExp, option: string) {
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

test.describe("the filter drawer is the filter surface", () => {
  /**
   * One surface at every width, unlike the payments table's pills. That is the
   * point of this layout: there is no desktop tree and mobile tree to keep in
   * step, which is how this block once shipped filters reachable on no phone.
   */
  for (const width of [375, 1280]) {
    test(`reaches all five filters at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ height: 900, width });
      await openUsers(page);

      await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
      const rows = await drawerRows(page);

      expect(rows).toEqual([
        "Role All",
        "Status All",
        "Seats All",
        "Two-factor All",
        "Created Any",
        "Sort Name (A–Z)",
      ]);
    });
  }

  test("is a bottom sheet on a phone and a side panel on a desktop", async ({
    page,
  }) => {
    // `swipeDirection` is a prop, not a class, so the two shells are rendered
    // behind a CSS fork. Exactly one may be in the accessibility tree, or a
    // screen reader — and `getByRole` — would find two Filters buttons.
    for (const [width, expected] of [
      [375, "bottom"],
      [1280, "right"],
    ] as const) {
      // biome-ignore lint/performance/noAwaitInLoops: one page, resized in turn
      await page.setViewportSize({ height: 900, width });
      // biome-ignore lint/performance/noAwaitInLoops: sequential by nature
      await openUsers(page);

      const trigger = page.getByRole("button", { name: FILTERS_TRIGGER });
      // biome-ignore lint/performance/noAwaitInLoops: sequential by nature
      expect(await trigger.count()).toBe(1);
      // biome-ignore lint/performance/noAwaitInLoops: sequential by nature
      await trigger.click();

      // biome-ignore lint/performance/noAwaitInLoops: sequential by nature
      const box = await page
        .locator('[data-slot="drawer-content"]')
        .boundingBox();
      const edge =
        (box?.x ?? 0) + (box?.width ?? 0) >= width - 16 && (box?.x ?? 0) > 0
          ? "right"
          : "bottom";
      expect(edge).toBe(expected);
    }
  });

  /**
   * The side panel is already capped by the Drawer (`max-w-md` once `floating`
   * applies), so the bottom sheet's own `max-w-sm` centring column must not be
   * carried over into it — that carved 32px of dead margin out of each side, on
   * top of the 16px `DrawerFooter` legitimately owns. And `DrawerFooter` only
   * pins to the foot when it is a sibling of the scrolling body: nested inside
   * `StepperContent`, which animates to its measured step height, it floated
   * directly under the last row with the rest of the panel empty below it.
   */
  test("the side panel's column spans the panel, and Apply sits at its foot", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await openUsers(page);
    await page.getByRole("button", { name: FILTERS_TRIGGER }).click();

    const panel = page.locator('[data-slot="drawer-content"]');
    const panelBox = await panel.boundingBox();
    const applyBox = await panel
      .getByRole("button", { exact: true, name: "Apply" })
      .boundingBox();
    if (!(panelBox && applyBox)) {
      throw new Error("drawer or Apply button not laid out");
    }

    // 16px is DrawerFooter's own p-4. Nothing else may inset the column.
    expect(applyBox.x - panelBox.x).toBeLessThanOrEqual(20);
    // …and the footer pins to the foot of a full-height panel.
    expect(
      panelBox.y + panelBox.height - (applyBox.y + applyBox.height)
    ).toBeLessThan(24);
  });

  test("drills into a filter and applies it", async ({ page }) => {
    await openUsers(page);
    const total = await rowCount(page);

    await page.getByRole("button", { name: FILTERS_TRIGGER }).click();
    const drawer = page.locator('[data-slot="drawer-content"]');
    await expect(drawer.getByText("Filters")).toBeVisible();

    await drawer.getByRole("button", { name: ROLE_ROW }).click();
    // The Stepper keeps the outgoing step mounted while it slides, so assert
    // on the step's own content rather than counting titles.
    await expect(drawer.getByRole("button", { name: "Back" })).toBeVisible();
    await drawer.getByText("Viewer", { exact: true }).click();
    expect(await rowCount(page)).toBeLessThan(total);

    // Back returns to the menu, which now shows the picked value.
    await drawer.getByRole("button", { name: "Back" }).click();
    await expect(drawer.getByRole("button", { name: ROLE_ROW })).toContainText(
      "Viewer"
    );
  });
});

test.describe("applied filters are chips", () => {
  test("one chip per applied filter, and none when nothing is", async ({
    page,
  }) => {
    await openUsers(page);

    // Nothing applied: no row at all, rather than an empty container holding
    // space for one.
    await expect(page.locator("[data-filter-chip]")).toHaveCount(0);

    await applyFilter(page, ROLE_ROW, "Admin");
    await applyFilter(page, SEATS_ROW, "One seat");

    expect(await chipLabels(page)).toEqual(["Role: Admin", "Seats: One seat"]);
  });

  test("the Filters count agrees with the chips, and ignores sort", async ({
    page,
  }) => {
    await openUsers(page);
    const trigger = page.getByRole("button", { name: FILTERS_TRIGGER });

    // Nothing applied: the badge is absent, not a zero.
    await expect(trigger).toHaveText("Filters");

    await applyFilter(page, ROLE_ROW, "Admin");
    await applyFilter(page, SEATS_ROW, "One seat");

    // The count is the length of the list the chips render, so the two cannot
    // drift. The payments badge this block once carried could: it counted the
    // panel's filters while pills showed the rest.
    expect(await page.locator("[data-filter-chip]").count()).toBe(2);
    await expect(trigger).toHaveText("Filters2");

    // Sort lives in the same drawer and is not a filter. A badge that ticks up
    // when you reorder a column is lying about what it counts.
    await applyFilter(page, SORT_ROW, "Seats");
    await expect(trigger).toHaveText("Filters2");
  });

  test("a chip removes only its own filter", async ({ page }) => {
    await openUsers(page);

    await applyFilter(page, ROLE_ROW, "Member");
    await applyFilter(page, SEATS_ROW, "One seat");
    await applyFilter(page, TWO_FACTOR_ROW, "Enabled");
    const narrowed = await rowCount(page);

    await page.getByRole("button", { name: "Remove Seats filter" }).click();

    expect(await chipLabels(page)).toEqual([
      "Role: Member",
      "Two-factor: Enabled",
    ]);
    expect(await rowCount(page)).toBeGreaterThanOrEqual(narrowed);
  });

  test("each remove button names the filter it removes", async ({ page }) => {
    await openUsers(page);

    await applyFilter(page, ROLE_ROW, "Admin");
    await applyFilter(page, SEATS_ROW, "One seat");

    // Two buttons both labelled "Remove" would leave a screen reader to work
    // out which from context it does not have.
    const labels = await page
      .locator("[data-filter-chip] button")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("aria-label")));

    expect(labels).toEqual(["Remove Role filter", "Remove Seats filter"]);
  });

  test("the chip nests no interactive element inside another", async ({
    page,
  }) => {
    await openUsers(page);
    await applyFilter(page, ROLE_ROW, "Admin");

    // This is why the chip is built on `Badge` and not `TagGroup`:
    // `TagGroupItem` renders its body as a button and puts the remove control
    // inside it, which is invalid and leaves the label focusable.
    const nested = await page.evaluate(
      () =>
        [...document.querySelectorAll("[data-filter-chip] button")].filter(
          (button) => button.parentElement?.closest("button")
        ).length
    );

    expect(nested).toBe(0);
  });

  test("Clear all empties the chips and restores every row", async ({
    page,
  }) => {
    await openUsers(page);
    const total = await rowCount(page);

    await page.getByLabel("Search users").fill("a");
    await applyFilter(page, ROLE_ROW, "Admin");
    expect(await rowCount(page)).toBeLessThan(total);

    await page.getByRole("button", { name: "Clear all" }).first().click();

    expect(await chipLabels(page)).toEqual([]);
    expect(await rowCount(page)).toBe(total);
  });
});

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
    await page.getByRole("menuitemradio", { name: "Seats" }).click();

    const seats = page.getByRole("columnheader", { name: SEATS_COLUMN });
    await expect(seats).toHaveAttribute("aria-sort", "descending");
  });

  /**
   * Column and direction are two choices, not one. The flat cross-product
   * this replaced meant changing direction cost finding your column again in
   * a list that had grown to hold both.
   */
  test("picks the column and the direction separately", async ({ page }) => {
    await openUsers(page);
    const trigger = page.getByRole("button", { name: SORT_TRIGGER });

    await openMenu(page, trigger);
    // Five columns plus Unsorted, then two directions — not eleven pairings.
    expect(await page.getByRole("menuitemradio").allTextContents()).toEqual([
      "Unsorted",
      "ID",
      "Name",
      "Role",
      "Seats",
      "Last active",
      "A–Z",
      "Z–A",
    ]);

    // A column takes its natural direction, and the directions relabel to say
    // what the order means for it — "Ascending" would say nothing.
    await page.getByRole("menuitemradio", { name: "Seats" }).click();
    await expect(trigger).toContainText("Seats");
    await expect(trigger).toContainText("Most first");

    await openMenu(page, trigger);
    expect(
      (await page.getByRole("menuitemradio").allTextContents()).slice(-2)
    ).toEqual(["Fewest first", "Most first"]);

    // Changing direction keeps the column.
    await page.getByRole("menuitemradio", { name: "Fewest first" }).click();
    await expect(trigger).toContainText("Seats");
    await expect(
      page.getByRole("columnheader", { name: SEATS_COLUMN })
    ).toHaveAttribute("aria-sort", "ascending");
  });

  test("offers no direction while nothing is sorted", async ({ page }) => {
    await openUsers(page);
    const trigger = page.getByRole("button", { name: SORT_TRIGGER });

    await openMenu(page, trigger);
    await page.getByRole("menuitemradio", { name: "Unsorted" }).click();

    // Two directions with nothing to order are controls that cannot act.
    await openMenu(page, trigger);
    expect(await page.getByRole("menuitemradio").allTextContents()).toEqual([
      "Unsorted",
      "ID",
      "Name",
      "Role",
      "Seats",
      "Last active",
    ]);
  });
});

test("Clear resets the filters and leaves the sort alone", async ({ page }) => {
  await openUsers(page);

  // Sort is not a filter, so it is excluded from the active count and Clear
  // must not touch it. Without this, clearing a search would silently reorder
  // the table under the reader.
  await page.getByRole("button", { name: SORT_ASC_LABEL }).click();
  await page.getByRole("menuitemradio", { name: "Seats" }).click();

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
