import { expect, test } from "@playwright/test";

import { distance, shoot } from "./pixels";
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

async function gotoPlainFixture(page: import("@playwright/test").Page) {
  await page.goto("/e2e/reel-plain");
  await page
    .locator('html[data-fixture-hydrated="reel-plain"]')
    .waitFor({ state: "attached" });
}

/** The private strip lengths, the hit areas' display and the mask's layers. */
function plainState(page: import("@playwright/test").Page, testId: string) {
  return page.getByTestId(testId).evaluate((host) => {
    const viewport = host.querySelector(
      '[data-slot="reel-viewport"]'
    ) as HTMLElement;
    const style = getComputedStyle(viewport);
    return {
      insets: [
        style.getPropertyValue("--_ks-reel-inset-left"),
        style.getPropertyValue("--_ks-reel-inset-right"),
      ],
      displays: [
        ...host.querySelectorAll('[data-slot="reel"] > span[data-side]'),
      ].map((el) => getComputedStyle(el).display),
      fadeEnd: Number.parseFloat(
        style.getPropertyValue("--ks-scroll-fade-end")
      ),
      layers: style.maskImage.split("linear-gradient(").length - 1,
      range: viewport.scrollWidth - viewport.clientWidth,
    };
  });
}

/**
 * T-GATE. A plain arrow's hidden strip goes through the same gate as the
 * arrow: on a touch-primary device, `pointer` and `none` draw no strip (the
 * soft fade alone is the cue) while `always` draws both.
 */
test.describe("Reel's plain arrows on a touch-primary device", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    viewport: { height: 740, width: 375 },
  });

  test("draw a hidden strip only where the arrow can show", async ({
    page,
  }) => {
    await gotoPlainFixture(page);
    expect(
      await page.evaluate(
        () => matchMedia("(hover: hover) and (pointer: fine)").matches
      )
    ).toBe(false);
    for (const id of ["plain-pointer", "plain-none"]) {
      // biome-ignore lint/performance/noAwaitInLoops: two rows, in order
      await expect
        .poll(() => plainState(page, id), { message: id })
        .toMatchObject({
          insets: ["0px", "0px"],
          displays: ["none", "none"],
          fadeEnd: 1,
          layers: 3,
        });
      expect((await plainState(page, id)).range).toBeGreaterThan(0);
    }
    await expect
      .poll(() => plainState(page, "plain-always"))
      .toMatchObject({ insets: ["0px", "20px"], displays: ["flex", "flex"] });
    // The strip hides the row under the end chevron: the surface shows.
    const host = page.getByTestId("plain-always");
    const end = host.locator('[data-slot="reel"] > span[data-side="end"]');
    await expect(end).toBeVisible();
    await host.locator("svg").evaluateAll((svgs) => {
      for (const svg of svgs) {
        (svg as SVGElement).style.visibility = "hidden";
      }
    });
    const pixels = await shoot(page, host.locator('[data-slot="reel"]'));
    const surface = pixels.at(1, 1);
    const bad: string[] = [];
    for (let x = 0; x < 20; x++) {
      for (let y = 2; y < pixels.height - 2; y += 2) {
        const p = pixels.at(pixels.width - 1 - x, y);
        if (distance(p, surface) > 2) {
          bad.push(`${x},${y}:${p.join(",")}`);
        }
      }
    }
    expect(bad.slice(0, 5)).toEqual([]);
  });
});

/**
 * T-DEFAULT-UNCHANGED (computed half; the pixel half is the before/after
 * render). The default arrows and a bare ks-scroll-fade-x row keep the one
 * soft gradient they had, with no strip.
 */
test.describe("Reel's default arrows and the bare utility", () => {
  test("keep one soft gradient and no hidden strip", async ({ page }) => {
    await gotoPlainFixture(page);
    await expect
      .poll(() => plainState(page, "default-always"))
      .toMatchObject({ insets: ["0px", "0px"], layers: 1, fadeEnd: 1 });
    const utility = await page
      .getByTestId("utility")
      .locator(".ks-scroll-fade-x")
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          layers: style.maskImage.split("linear-gradient(").length - 1,
          insets: [
            style.getPropertyValue("--_ks-reel-inset-left"),
            style.getPropertyValue("--_ks-reel-inset-right"),
          ],
        };
      });
    expect(utility).toEqual({ layers: 1, insets: ["0px", "0px"] });
  });
});

/**
 * A fade deeper than stock is measured from the end of the plain arrow's
 * clear strip: with a 6rem fade the row is still fading in 80px past the
 * 20px strip, and fully visible 96px past it. The strip on each physical side
 * ramps with that side's own scroll progress.
 */
test.describe("Reel's plain arrows with a deep fade", () => {
  /** Alpha of the row at `x` CSS px from the viewport's left or right edge. */
  async function alphas(
    page: import("@playwright/test").Page,
    id: string,
    offset: number,
    samples: { side: "left" | "right"; x: number }[]
  ) {
    const host = page.getByTestId(id);
    await host.evaluate((el, to) => {
      const viewport = el.querySelector(
        '[data-slot="reel-viewport"]'
      ) as HTMLElement;
      const max = viewport.scrollWidth - viewport.clientWidth;
      const rtl = getComputedStyle(viewport).direction === "rtl";
      viewport.scrollLeft = (rtl ? -1 : 1) * Math.round(max * to);
      for (const svg of el.querySelectorAll<SVGElement>("svg")) {
        svg.style.visibility = "hidden";
      }
    }, offset);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    );
    const viewport = host.locator('[data-slot="reel-viewport"]');
    const pixels = await shoot(page, viewport);
    const y = pixels.height / 2;
    // References from the same shot: the page through the left strip's
    // padding, and the row in the middle of the viewport, past both fades.
    const bg = pixels.at(1, y);
    const fg = pixels.at(pixels.width / 2, y);
    return samples.map(({ side, x }) => {
      const p = pixels.at(side === "left" ? x : pixels.width - x, y);
      return {
        a: Math.round(((bg[0] - p[0]) / (bg[0] - fg[0])) * 100) / 100,
        // Colour-channel levels from the bare surface and the full row.
        toSurface: distance(p, bg),
        toFull: distance(p, fg),
      };
    });
  }

  // Midpoint, left to right: both strips on, both sides at full progress.
  // Pixel centres measured from each side's own edge: 19.5px (strip),
  // 100.5px (80px past it), 114.5px (just inside the 116px endpoint) and
  // 116.5px (past it).
  for (const side of ["left", "right"] as const) {
    test(`ramps over the full depth beyond the strip, ${side}`, async ({
      page,
    }) => {
      await gotoPlainFixture(page);
      const [strip, mid, inside, past] = await alphas(page, "deep-ltr", 0.5, [
        { side, x: 19.5 },
        { side, x: 100.5 },
        { side, x: 114.5 },
        { side, x: 116.5 },
      ]);
      expect({
        strip: strip.toSurface <= 1,
        mid: mid.a > 0.05 && mid.a < 0.95,
        inside: inside.toFull >= 2,
        past: past.toFull <= 1,
      }).toEqual({ strip: true, mid: true, inside: true, past: true });
    });
  }

  test("ramps each physical side with its own progress, right to left", async ({
    page,
  }) => {
    await gotoPlainFixture(page);
    // Early in the range, right to left: the start side (right) has scrolled
    // a little, so its ramp is short; the end side (left) is at full depth.
    const [right72, left100] = await alphas(page, "deep-rtl", 0.04, [
      { side: "right", x: 72 },
      { side: "left", x: 100 },
    ]);
    expect(right72.a).toBeGreaterThan(0.97);
    expect(left100.a).toBeLessThan(0.95);
  });
});

/**
 * The default `pointer` gate on a desktop: a plain Reel shows its arrows
 * and draws each strip where there is more to scroll.
 */
test("plain arrows behind the pointer gate show on a fine pointer", async ({
  page,
}) => {
  await gotoPlainFixture(page);
  expect(
    await page.evaluate(
      () => matchMedia("(hover: hover) and (pointer: fine)").matches
    )
  ).toBe(true);
  const at = (to: number) =>
    page.getByTestId("plain-pointer").evaluate((host, where) => {
      const viewport = host.querySelector(
        '[data-slot="reel-viewport"]'
      ) as HTMLElement;
      viewport.scrollLeft = Math.round(
        (viewport.scrollWidth - viewport.clientWidth) * where
      );
      return new Promise<{ shown: boolean[]; insets: string[] }>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const style = getComputedStyle(viewport);
            resolve({
              shown: [
                ...host.querySelectorAll<HTMLElement>(
                  '[data-slot="reel"] > span[data-side]'
                ),
              ].map((area) => {
                const s = getComputedStyle(area);
                return s.display !== "none" && s.visibility === "visible";
              }),
              insets: [
                style.getPropertyValue("--_ks-reel-inset-left"),
                style.getPropertyValue("--_ks-reel-inset-right"),
              ],
            });
          })
        )
      );
    }, to);
  expect(await at(0)).toEqual({
    shown: [false, true],
    insets: ["0px", "20px"],
  });
  expect(await at(0.5)).toEqual({
    shown: [true, true],
    insets: ["20px", "20px"],
  });
});

/**
 * Reel's default arrows paint exactly as the Reel that first shipped: the
 * filter-chips row in the component as it is now and in a frozen copy of
 * it, at the start and mid-range, in both themes, pixel for pixel.
 */
test.describe("Reel's default arrows paint as they first shipped", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    test(colorScheme, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      try {
        await gotoPlainFixture(page);
        await page.evaluate((dark) => {
          document.documentElement.classList.toggle("dark", dark);
        }, colorScheme === "dark");
        for (const where of [0, 0.5]) {
          const shots: Awaited<ReturnType<typeof shoot>>[] = [];
          for (const which of ["now", "frozen"]) {
            const host = page.getByTestId(`chips-${which}`);
            // biome-ignore lint/performance/noAwaitInLoops: two rows, in order
            await host.evaluate((el, to) => {
              const viewport = el.querySelector(
                '[data-slot="reel-viewport"]'
              ) as HTMLElement;
              viewport.scrollLeft = Math.round(
                (viewport.scrollWidth - viewport.clientWidth) * to
              );
            }, where);
            await page.waitForTimeout(300);
            shots.push(await shoot(page, host.locator('[data-slot="reel"]')));
          }
          const [now, frozen] = shots;
          expect([now.width, now.height]).toEqual([
            frozen.width,
            frozen.height,
          ]);
          const differing: string[] = [];
          for (let y = 0.5; y < now.height; y += 1) {
            for (let x = 0.5; x < now.width; x += 1) {
              if (distance(now.at(x, y), frozen.at(x, y)) > 0) {
                differing.push(`${x},${y}`);
              }
            }
          }
          expect(differing.slice(0, 5), `at ${where}`).toEqual([]);
        }
      } finally {
        await context.close();
      }
    });
  }
});

/**
 * Each plain Reel keeps its own fade progress: an inner plain Reel at its
 * start, inside an outer one scrolled to its middle, shows its row in full
 * at its start edge (no strip and no fade there).
 */
test.describe("A nested plain Reel keeps its own fade progress", () => {
  for (const dir of ["ltr", "rtl"] as const) {
    test(dir, async ({ page }) => {
      await gotoPlainFixture(page);
      await page.getByTestId(`nested-${dir}`).evaluate((host) => {
        const [outer, inner] = host.querySelectorAll<HTMLElement>(
          '[data-slot="reel-viewport"]'
        );
        const rtl = getComputedStyle(outer).direction === "rtl";
        const mid = (outer.scrollWidth - outer.clientWidth) / 2;
        outer.scrollLeft = rtl ? -mid : mid;
        inner.scrollLeft = 0;
      });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          )
      );
      const inner = page
        .getByTestId(`inner-${dir}`)
        .locator('[data-slot="reel-viewport"]')
        .first();
      const pixels = await shoot(page, inner);
      const y = pixels.height / 2;
      // The first content pixel past the viewport's 4px padding, at the
      // start edge, against the row's middle.
      const first = pixels.at(dir === "ltr" ? 4.5 : pixels.width - 4.5, y);
      const full = pixels.at(dir === "ltr" ? 40 : pixels.width - 40, y);
      expect(distance(first, full)).toBeLessThanOrEqual(1);
    });
  }
});
