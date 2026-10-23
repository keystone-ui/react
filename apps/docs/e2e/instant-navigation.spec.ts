import { instant } from "@next/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Regression guard for the navigation model (Cache Components + Partial
 * Prefetching + hover-intent prefetch).
 *
 * `instant()` makes the router paint only what is already in the prefetch
 * cache and holds everything else back until the callback returns, so what
 * is visible inside the callback is exactly what a user sees the moment
 * they click. Needs a production build made with EXPOSE_TESTING_API=1
 * (see playwright.config.ts); without the testing API the cookie is ignored
 * and the "paints the App Shell first" test below fails.
 */

const DOCS_COMPONENT_PATH = /^\/docs\/components\/[a-z0-9-]+$/;
const BLOG_POST_PATH = /^\/blog\/[a-z0-9-]+$/;
// How long the control test waits before checking held-back content is
// still absent.
const HOLD_BACK_MS = 2000;

function heading(page: Page, name?: string): Locator {
  return page.getByRole("heading", { level: 1, name });
}

// IntentLink switches a link to prefetch={true} on hover, which fetches the
// page's own payload on top of the shared App Shell. Wait for that to land
// so the cache is warm before the navigation under test.
async function hoverUntilPrefetched(page: Page, link: Locator): Promise<void> {
  await link.hover();
  await page.waitForLoadState("networkidle");
}

test.describe("docs pages", () => {
  test("a direct load is complete in the static shell", async ({
    page,
    baseURL,
  }) => {
    await instant(
      page,
      async () => {
        await page.goto("/docs/components/button");
        await expect(heading(page, "Button")).toBeVisible();
      },
      { baseURL }
    );
  });

  test("a hovered sidebar link navigates with the whole page at once", async ({
    page,
  }) => {
    await page.goto("/docs/components/button");
    const link = page.locator('a[href="/docs/components/input"]').first();
    await hoverUntilPrefetched(page, link);

    await instant(page, async () => {
      await link.click();
      await page.waitForURL((url) => url.pathname === "/docs/components/input");
      await expect(heading(page, "Input")).toBeVisible();
    });
  });

  test("an un-hovered link paints the App Shell first, then the page", async ({
    page,
  }) => {
    await page.goto("/docs/components/button");
    await page.waitForLoadState("networkidle");
    const link = page.locator('a[href="/docs/components/select"]').first();

    await instant(page, async () => {
      // A synthetic click: no hover and no focus, so IntentLink never
      // upgrades the prefetch and only the shared App Shell is cached.
      await link.dispatchEvent("click");
      await page.waitForURL(
        (url) => url.pathname === "/docs/components/select"
      );
      await expect(
        page.locator('[data-slot="skeleton"]').first()
      ).toBeVisible();
      // The page's own payload is not in the prefetch cache, so `instant()`
      // holds it back for as long as this callback runs. Without the
      // testing API it streams in within a few hundred milliseconds on
      // localhost, so the check after the wait fails, which is what makes
      // this test the control for the whole file.
      await page.waitForTimeout(HOLD_BACK_MS);
      await expect(heading(page, "Select")).toHaveCount(0);
    });

    await expect(heading(page, "Select")).toBeVisible();
  });
});

test.describe("home surfaces", () => {
  test("a gallery card navigates to its docs page at once after hover", async ({
    page,
  }) => {
    await page.goto("/gallery");
    const link = page.locator('a[href^="/docs/components/"]').first();
    await hoverUntilPrefetched(page, link);

    await instant(page, async () => {
      await link.click();
      await page.waitForURL((url) => DOCS_COMPONENT_PATH.test(url.pathname));
      await expect(heading(page)).toBeVisible();
      await expect(heading(page)).not.toBeEmpty();
    });
  });

  test("a blog card navigates to its post at once after hover", async ({
    page,
  }) => {
    await page.goto("/blog");
    const link = page.locator('a[href^="/blog/"]').first();
    await hoverUntilPrefetched(page, link);

    await instant(page, async () => {
      await link.click();
      await page.waitForURL((url) => BLOG_POST_PATH.test(url.pathname));
      await expect(heading(page)).toBeVisible();
      await expect(heading(page)).not.toBeEmpty();
    });
  });
});
