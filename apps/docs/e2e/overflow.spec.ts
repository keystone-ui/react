import { expect, test } from "@playwright/test";

import { demos } from "../demos";

/**
 * No block may give the document a horizontal scrollbar.
 *
 * Grid and flex children resolve their minimum size to `min-content`, so a
 * single wide child — a table, an untruncated string, a chart with an explicit
 * pixel height — pushes its track open and the whole page starts scrolling
 * sideways. It is invisible until real data arrives, it affects every page
 * using that layout, and `[&>*]:min-w-0` is the fix. This is what makes that
 * convention enforceable rather than decorative.
 *
 * Measured against `/preview/<name>`, which renders a block full-bleed with no
 * docs chrome, so what is measured is the block's own layout.
 */

const BLOCK_NAMES = Object.keys(demos)
  .filter((name) => name.startsWith("block-"))
  .sort();

// 768 matters most: it is a real tablet width, and the width where this class
// of bug clusters — wide enough that a desktop grid is still in play, narrow
// enough that it no longer fits.
const WIDTHS = [375, 768, 1280];

// 1px for subpixel rounding. A genuine overflow here is tens or hundreds of
// pixels, never one.
const TOLERANCE = 1;

test.describe("block previews do not overflow horizontally", () => {
  for (const name of BLOCK_NAMES) {
    for (const width of WIDTHS) {
      test(`${name} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ height: 900, width });
        await page.goto(`/preview/${name}`);
        await page.waitForLoadState("networkidle");

        const overflow = await page.evaluate(() => {
          const root = document.documentElement;
          return root.scrollWidth - root.clientWidth;
        });

        expect(
          overflow,
          `${name} overflows the viewport by ${overflow}px at ${width}px wide`
        ).toBeLessThanOrEqual(TOLERANCE);
      });
    }
  }
});

/**
 * The positive control, and it is not optional.
 *
 * "Nothing overflows" passes just as well when no content is wide enough to
 * overflow anything — so the suite above would go green the day a table
 * stopped being wide, while testing nothing. This asserts that a wide table
 * really does scroll, inside its own container rather than the document.
 *
 * `Table` already emits `[data-slot="table-container"]`, so this needs no
 * test-id plumbing.
 */
test("a wide table scrolls inside its own container, not the page", async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 768 });
  await page.goto("/preview/block-tickets-01");
  await page.waitForLoadState("networkidle");

  const scroller = page.locator('[data-slot="table-container"]').first();
  await expect(scroller).toBeAttached();

  const scrolls = await scroller.evaluate(
    (element) => element.scrollWidth > element.clientWidth
  );
  expect(
    scrolls,
    "the tickets table is no longer wider than its container, so the overflow suite above is not proving anything"
  ).toBe(true);
});
