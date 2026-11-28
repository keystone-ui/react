import { expect, type Page, test } from "@playwright/test";

/**
 * The docs sidebar shows one section at a time (components/docs-sidebar.tsx).
 * The view logic is unit-tested in lib/sidebar.test.ts; what only a browser
 * can decide is which view is visible and reachable, where focus goes, and
 * that a page loads with its own section open.
 */

const sidebar = (page: Page) => page.locator("#nd-sidebar");
const mainView = (page: Page) => sidebar(page).locator('[data-view="main"]');
const sectionView = (page: Page) =>
  sidebar(page).locator('[data-view="section"]');

test.describe("docs sidebar", () => {
  test("a section row opens its pages, and the back row returns with focus", async ({
    page,
  }) => {
    await page.goto("/docs/components/button");

    const forms = mainView(page).getByRole("button", { name: "Forms" });
    await expect(forms).toBeVisible();
    await expect(
      sidebar(page).getByRole("link", { name: "Checkbox" })
    ).toHaveCount(0);

    await forms.click();
    const back = sectionView(page).getByRole("button", {
      name: "Back from Forms",
    });
    await expect(back).toBeFocused();
    await expect(
      sectionView(page).getByRole("link", { name: "Checkbox" })
    ).toBeVisible();
    // The list it left can't be clicked or tabbed into.
    await expect(mainView(page)).toHaveAttribute("inert", "");

    await back.click();
    await expect(forms).toBeFocused();
    await expect(sectionView(page)).toHaveAttribute("inert", "");
  });

  test("a page loads with its own section open and marked current", async ({
    page,
  }) => {
    await page.goto("/docs/components/checkbox");

    await expect(
      sectionView(page).getByRole("button", { name: "Back from Forms" })
    ).toBeVisible();
    await expect(
      sectionView(page).getByRole("link", { name: "Checkbox" })
    ).toHaveAttribute("data-active", "true");
  });

  test("moving to a page in the open section keeps the section open", async ({
    page,
  }) => {
    await page.goto("/docs/components/checkbox");
    await sectionView(page).getByRole("link", { name: "Switch" }).click();

    await page.waitForURL((url) => url.pathname === "/docs/components/switch");
    await expect(
      sectionView(page).getByRole("link", { name: "Switch" })
    ).toHaveAttribute("data-active", "true");
    await expect(mainView(page)).toHaveAttribute("inert", "");
  });

  test("each tab lists its own sections", async ({ page }) => {
    await page.goto("/docs/blocks/signin-01");

    await expect(
      sectionView(page).getByRole("button", { name: "Back from Sign in" })
    ).toBeVisible();
    await sectionView(page)
      .getByRole("button", { name: "Back from Sign in" })
      .click();
    await expect(
      mainView(page).getByRole("button", { name: "Betting" })
    ).toBeVisible();
    await expect(
      mainView(page).getByRole("button", { name: "Forms" })
    ).toHaveCount(0);
  });
});
