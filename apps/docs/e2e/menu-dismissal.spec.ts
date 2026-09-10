import { expect, type Page, test } from "@playwright/test";

/**
 * A single-select menu must close when a value is picked.
 *
 * Not a cosmetic complaint about a lingering popup. Base UI keeps a fullscreen
 * `position: fixed` backdrop with `pointer-events: auto` mounted while a menu
 * is open, so a menu that stays open swallows the user's next click *anywhere
 * on the page*. In a filter toolbar that presents as "the second filter is
 * broken", and it is invisible to a jsdom test, which has no hit-testing and
 * no backdrop geometry — `packages/ui/src/dropdown-menu.test.tsx` can prove the
 * popup unmounts, but only a browser can prove the next click lands.
 *
 * `DropdownMenuRadioItem` therefore defaults `closeOnClick` to `true` while
 * `DropdownMenuCheckboxItem` keeps Base UI's `false`. Both halves are pinned
 * here, because "fixing" the asymmetry breaks one block or the other.
 */

const ROLE_TRIGGER = /All roles/;
const STATUS_TRIGGER = /All statuses/;
const CLEAR_BUTTON = /^Clear/;
const SINGLE_PAGE = /Page 1 of 1/;
const TICKETS_TRIGGER = /Status/;

const rowCount = (page: Page) =>
  page.locator('[data-slot="table-body"] tr').count();

test.describe("admin-01 filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/preview/block-admin-01");
    // The users table lives behind the Users section; the block opens on
    // Overview.
    await page.getByRole("button", { name: "Users" }).click();
    await expect(page.getByLabel("Search users")).toBeVisible();
  });

  test("a picked filter closes its menu and narrows the table", async ({
    page,
  }) => {
    const total = await rowCount(page);
    expect(total).toBeGreaterThan(0);

    await page.getByRole("button", { name: ROLE_TRIGGER }).click();
    await page.getByRole("menuitemradio", { name: "Viewer" }).click();

    await expect(page.getByRole("menuitemradio")).toHaveCount(0);
    expect(await rowCount(page)).toBeLessThan(total);
  });

  test("a second filter is still clickable after the first", async ({
    page,
  }) => {
    await page.getByRole("button", { name: ROLE_TRIGGER }).click();
    await page.getByRole("menuitemradio", { name: "Viewer" }).click();

    // This is the click the inert backdrop used to eat.
    await page.getByRole("button", { name: STATUS_TRIGGER }).click();
    await page.getByRole("menuitemradio", { name: "Active" }).click();

    await expect(page.getByRole("button", { name: "Clear 2" })).toBeVisible();
  });

  test("Clear restores every filter", async ({ page }) => {
    const total = await rowCount(page);

    await page.getByRole("button", { name: ROLE_TRIGGER }).click();
    await page.getByRole("menuitemradio", { name: "Viewer" }).click();
    await page.getByLabel("Search users").fill("a");

    await page.getByRole("button", { name: CLEAR_BUTTON }).click();

    expect(await rowCount(page)).toBe(total);
    await expect(page.getByRole("button", { name: CLEAR_BUTTON })).toHaveCount(
      0
    );
    await expect(
      page.getByRole("button", { name: ROLE_TRIGGER })
    ).toBeVisible();
  });

  test("filtering resets pagination", async ({ page }) => {
    await page.getByLabel("Search users").fill("zzz-no-match");
    await expect(page.getByText(SINGLE_PAGE)).toBeVisible();
  });
});

test.describe("tickets-01 menus", () => {
  test("a single-select menu closes, and the next click lands", async ({
    page,
  }) => {
    await page.goto("/preview/block-tickets-01");

    const trigger = page.getByRole("button", { name: TICKETS_TRIGGER }).first();
    await trigger.click();
    await page.getByRole("menuitemradio").first().click();
    await expect(page.getByRole("menuitemradio")).toHaveCount(0);

    await trigger.click();
    await expect(page.getByRole("menuitemradio").first()).toBeVisible();
  });

  test("the column menu stays open per item", async ({ page }) => {
    await page.goto("/preview/block-tickets-01");

    await page.getByRole("button", { name: "Table options" }).click();
    const items = page.getByRole("menuitemcheckbox");
    const count = await items.count();
    expect(count).toBeGreaterThan(1);

    await items.first().click();

    // Multi-select: still open, so the rest of the group is reachable.
    await expect(page.getByRole("menuitemcheckbox")).toHaveCount(count);
  });
});
