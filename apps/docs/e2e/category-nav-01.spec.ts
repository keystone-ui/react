import { expect, test } from "@playwright/test";

import { gotoPreview } from "./preview";

/**
 * The bar is a set of links to category pages, so the accessibility tree must
 * say so: a named navigation landmark holding a list of links, one of them
 * the current page, and nothing announced as a button. Style navigation
 * links with `buttonVariants` on an `<a href>`: Button's non-native mode
 * assigns the button role. The Reel's arrows, which are hidden from
 * assistive technology, must not show up.
 */
test.describe("category-nav-01", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPreview(page, "block-category-nav-01");
  });

  test("is a navigation landmark of links, with no buttons", async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: "Categories" });
    await expect(nav).toMatchAriaSnapshot(`
      - navigation "Categories":
        - list:
          - listitem:
            - link "All":
              - /url: /browse
          - listitem:
            - link "Featured":
              - /url: /browse/featured
          - listitem:
            - link "Games":
              - /url: /browse/games
          - listitem:
            - link "Music":
              - /url: /browse/music
          - listitem:
            - link "Film & TV":
              - /url: /browse/film
          - listitem:
            - link "Books":
              - /url: /browse/books
          - listitem:
            - link "Sport":
              - /url: /browse/sport
          - listitem:
            - link "Art & Design":
              - /url: /browse/art
          - listitem:
            - link "News":
              - /url: /browse/news
    `);
    await expect(nav.getByRole("button")).toHaveCount(0);
    // The arrows exist; they are only hidden from the tree.
    await expect(nav.locator('[data-slot="reel-arrow"]')).toHaveCount(2);
  });

  test("marks exactly one link as the current page", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Categories" });
    const current = nav.locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAccessibleName("All");
    await expect(current).toHaveAttribute("href", "/browse");

    // The preview marks a clicked link current instead of navigating.
    await page.setViewportSize({ width: 375, height: 700 });
    const news = nav.getByRole("link", { name: "News" });
    await news.focus();
    await page.keyboard.press("Enter");
    await expect(nav.locator('[aria-current="page"]')).toHaveAccessibleName(
      "News"
    );
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(news).toBeInViewport({ ratio: 1 });
  });
});
