import { expect, test } from "@playwright/test";

import { gotoPreview } from "./preview";

/**
 * The production stylesheet, not the dev one: Lightning CSS rewrites `:dir()`
 * into a list of `:lang()` selectors for browsers without `:dir()`, which
 * matched only pages that declare a right-to-left `lang`. A `dir="rtl"`
 * container must flip the fade whatever its language.
 */
test.describe("Reel in right-to-left", () => {
  test("fades the left edge at the start, in the built stylesheet", async ({
    page,
  }) => {
    await gotoPreview(page, "reel-rtl");
    const viewport = page.locator('[data-slot="reel-viewport"]');
    await expect(viewport).toHaveJSProperty("scrollLeft", 0);
    const mask = await viewport.evaluate(
      (el) => getComputedStyle(el).maskImage
    );
    expect(mask).toContain("to left");
    // The end arrow sits on the left.
    const end = page.locator('[data-slot="reel-arrow"][data-side="end"]');
    const box = await end.boundingBox();
    const reel = await page.locator('[data-slot="reel"]').boundingBox();
    expect(Math.round((box?.x ?? -1) - (reel?.x ?? 0))).toBe(0);
  });

  test("keeps left-to-right rows fading from the right", async ({ page }) => {
    await gotoPreview(page, "reel-default");
    const mask = await page
      .locator('[data-slot="reel-viewport"]')
      .evaluate((el) => getComputedStyle(el).maskImage);
    expect(mask).toContain("to right");
  });
});

/**
 * The nearest explicit `dir` decides the direction, for the fade and the
 * chevron alike, whatever an outer `dir` or the page's `lang` says. The
 * fixtures set the attributes on the built default preview.
 */
test.describe("Reel follows the nearest dir", () => {
  async function probe(page: import("@playwright/test").Page) {
    return await page.evaluate(() => {
      const reel = document.querySelector('[data-slot="reel"]') as HTMLElement;
      const viewport = reel.querySelector(
        '[data-slot="reel-viewport"]'
      ) as HTMLElement;
      const end = reel.querySelector(
        '[data-slot="reel-arrow"][data-side="end"]'
      ) as HTMLElement;
      const svg = end.querySelector("svg") as SVGElement;
      const r = reel.getBoundingClientRect();
      const e = end.getBoundingClientRect();
      const style = getComputedStyle(viewport);
      return {
        endVisible: getComputedStyle(end).visibility === "visible",
        direction: style.direction,
        maskTo: (["left", "right"] as const).find((side) =>
          style.maskImage.includes(`to ${side}`)
        ),
        fadeStart: Number.parseFloat(
          style.getPropertyValue("--ks-scroll-fade-start")
        ),
        fadeEnd: Number.parseFloat(
          style.getPropertyValue("--ks-scroll-fade-end")
        ),
        chevronX: Number.parseFloat(
          (getComputedStyle(svg).scale.split(" ")[0] || "1").replace(
            "none",
            "1"
          )
        ),
        endArrowSide: [
          Math.abs(e.left - r.left) < 1 && "left",
          Math.abs(r.right - e.right) < 1 && "right",
        ]
          .filter(Boolean)
          .join(","),
      };
    });
  }

  /**
   * Changing `dir` on a live page moves the scroll position without a scroll
   * the Reel can measure, so put the row back at its start and let the Reel
   * measure it, as a freshly loaded page would.
   */
  async function atStart(page: import("@playwright/test").Page) {
    await page.locator('[data-slot="reel-viewport"]').evaluate((el) => {
      el.scrollLeft = 0;
      el.dispatchEvent(new Event("scroll"));
    });
  }

  async function pressEnd(page: import("@playwright/test").Page) {
    const box = await page
      .locator('[data-slot="reel-arrow"][data-side="end"]')
      .boundingBox();
    if (!box) {
      throw new Error("no end arrow");
    }
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(400);
    return await page
      .locator('[data-slot="reel-viewport"]')
      .evaluate((el) => el.scrollLeft);
  }

  const LTR = {
    endVisible: true,
    direction: "ltr",
    maskTo: "right",
    fadeStart: 0,
    fadeEnd: 1,
    chevronX: 1,
    endArrowSide: "right",
  };
  const RTL = {
    endVisible: true,
    direction: "rtl",
    maskTo: "left",
    fadeStart: 0,
    fadeEnd: 1,
    chevronX: -1,
    endArrowSide: "left",
  };

  test("a left-to-right row inside a right-to-left page", async ({ page }) => {
    await gotoPreview(page, "reel-default");
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
      (document.querySelector("nav")?.parentElement as HTMLElement).dir = "ltr";
    });
    await atStart(page);
    await expect.poll(() => probe(page)).toEqual(LTR);
    expect(await pressEnd(page)).toBeGreaterThan(0);
  });

  test("a right-to-left row inside that left-to-right island", async ({
    page,
  }) => {
    await gotoPreview(page, "reel-default");
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
      const nav = document.querySelector("nav") as HTMLElement;
      (nav.parentElement as HTMLElement).dir = "ltr";
      nav.dir = "rtl";
    });
    await atStart(page);
    await expect.poll(() => probe(page)).toEqual(RTL);
    expect(await pressEnd(page)).toBeLessThan(0);
  });

  /**
   * A CSS direction or `dir="auto"` inherits the fade setting from the
   * nearest explicit `dir`: the English row's text runs left to right while
   * the fade and the chevrons follow the right-to-left section around it.
   * Paging follows the scroller's own direction. Pinned beside an explicit
   * left-to-right and right-to-left row with no outer boundary.
   */
  const AUTO_IN_RTL = {
    endVisible: true,
    direction: "ltr",
    maskTo: "left",
    fadeStart: 0,
    fadeEnd: 1,
    chevronX: -1,
    endArrowSide: "right",
  };

  for (const [name, setUp, expected, pages] of [
    [
      'dir="auto" inside a right-to-left section',
      () => {
        const nav = document.querySelector("nav") as HTMLElement;
        (nav.parentElement as HTMLElement).dir = "rtl";
        nav.dir = "auto";
      },
      AUTO_IN_RTL,
      1,
    ],
    [
      "a CSS direction inside a right-to-left section",
      () => {
        const nav = document.querySelector("nav") as HTMLElement;
        (nav.parentElement as HTMLElement).dir = "rtl";
        nav.style.direction = "ltr";
      },
      AUTO_IN_RTL,
      1,
    ],
    [
      "an explicit left-to-right row",
      () => {
        (document.querySelector("nav") as HTMLElement).dir = "ltr";
      },
      LTR,
      1,
    ],
    [
      "an explicit right-to-left row",
      () => {
        (document.querySelector("nav") as HTMLElement).dir = "rtl";
      },
      RTL,
      -1,
    ],
  ] as const) {
    test(name, async ({ page }) => {
      await gotoPreview(page, "reel-default");
      await page.evaluate(setUp);
      await atStart(page);
      await expect.poll(() => probe(page)).toEqual(expected);
      expect(Math.sign(await pressEnd(page))).toBe(pages);
    });
  }

  test("a left-to-right page in an Arabic language", async ({ page }) => {
    await gotoPreview(page, "reel-default");
    await page.evaluate(() => {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "ltr";
    });
    await atStart(page);
    await expect.poll(() => probe(page)).toEqual(LTR);
    expect(await pressEnd(page)).toBeGreaterThan(0);
  });
});

/**
 * `<Reel>` and `<Reel arrows="always">` around identical overflowing rows in
 * a context created touch-primary. The test-only fixture route is served by
 * the e2e build (EXPOSE_TESTING_API=1).
 */
test.describe("Reel arrows in a touch-primary context", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    viewport: { height: 740, width: 375 },
  });

  test('hides the default arrows and keeps "always" usable', async ({
    page,
  }) => {
    await page.goto("/e2e/reel-arrows");
    await page
      .locator('html[data-fixture-hydrated="reel-arrows"]')
      .waitFor({ state: "attached" });
    expect(
      await page.evaluate(() => [
        matchMedia("(pointer: coarse)").matches,
        matchMedia("(hover: none)").matches,
      ])
    ).toEqual([true, true]);
    // Painted, not only laid out: once hydrated, neither the end hit area
    // nor the button inside it is transparent or invisible on this device.
    const endArrow = page
      .getByTestId("always")
      .locator('[data-slot="reel-arrow"][data-side="end"]');
    const endArea = page
      .getByTestId("always")
      .locator('[data-slot="reel"] > span[data-side="end"]');
    await expect
      .poll(() =>
        Promise.all(
          [endArea, endArrow].map((locator) =>
            locator.evaluate((el) =>
              el.checkVisibility({
                opacityProperty: true,
                visibilityProperty: true,
              })
            )
          )
        )
      )
      .toEqual([true, true]);
    const viewport = (id: string) =>
      page.getByTestId(id).locator('[data-slot="reel-viewport"]');
    for (const id of ["pointer", "always"]) {
      expect(
        // biome-ignore lint/performance/noAwaitInLoops: two rows, in order
        await viewport(id).evaluate((el) => el.scrollWidth - el.clientWidth),
        `${id} scroll range`
      ).toBeGreaterThan(0);
    }
    const hitAreas = (id: string) =>
      page.getByTestId(id).locator('[data-slot="reel"] > span[data-side]');
    expect(
      await hitAreas("pointer").evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).display)
      )
    ).toEqual(["none", "none"]);
    // Start hidden (no content before it), end visible.
    expect(
      await hitAreas("always").evaluateAll((els) =>
        els.map((el) => el.checkVisibility({ visibilityProperty: true }))
      )
    ).toEqual([false, true]);
    const end = await endArrow.boundingBox();
    if (!end) {
      throw new Error("no end arrow");
    }
    await page.touchscreen.tap(end.x + end.width / 2, end.y + end.height / 2);
    await expect
      .poll(() => viewport("always").evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
  });
});

/**
 * The default `arrows="pointer"` on a touch-primary device: the row swipes
 * and the fade is its cue, so neither arrow is displayed even while the row
 * overflows.
 */
test.describe("Reel on a touch-primary device", () => {
  test("displays no default arrows while the row overflows", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { height: 740, width: 375 },
    });
    const page = await context.newPage();
    try {
      await gotoPreview(page, "reel-default");
      expect(
        await page.evaluate(
          () => matchMedia("(hover: hover) and (pointer: fine)").matches
        )
      ).toBe(false);
      const range = await page
        .locator('[data-slot="reel-viewport"]')
        .evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(range).toBeGreaterThan(0);
      const rendered = await page
        .locator('[data-slot="reel-arrow"]')
        .evaluateAll((els) => els.map((el) => el.getClientRects().length > 0));
      expect(rendered).toEqual([false, false]);
    } finally {
      await context.close();
    }
  });
});
