import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, type Page, test } from "@playwright/test";

import { distance, shoot } from "./pixels";

/**
 * Scrollable Tabs on Reel's plain arrows, read from pixels in the built
 * stylesheet: a bare chevron never draws over a tab, because the row is
 * hidden for 1.25rem under each visible chevron. The fixture route is served
 * by the e2e build alone (EXPOSE_TESTING_API=1).
 */

async function gotoFixture(page: Page) {
  await page.goto("/e2e/tabs-scrollable");
  await page
    .locator('html[data-fixture-hydrated="tabs-scrollable"]')
    .waitFor({ state: "attached" });
}

const DOCUMENTED_ZERO = /The value needs a unit \(`([^`]+)`, not `0`\)/;

const twoFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );

/** The scroll range of a fixture row, and its direction. */
function range(page: Page, id: string) {
  return page.getByTestId(id).evaluate((host) => {
    const viewport = host.querySelector(
      '[data-slot="reel-viewport"]'
    ) as HTMLElement;
    return viewport.scrollWidth - viewport.clientWidth;
  });
}

/** Scroll a row to `offset` from its start (negative scrollLeft in rtl). */
async function scrollTo(page: Page, id: string, offset: number) {
  await page.getByTestId(id).evaluate((host, to) => {
    const viewport = host.querySelector(
      '[data-slot="reel-viewport"]'
    ) as HTMLElement;
    const rtl = getComputedStyle(viewport).direction === "rtl";
    viewport.scrollLeft = rtl ? -to : to;
  }, offset);
  // The plain arrow and its strip switch together on the next frame.
  await twoFrames(page);
}

/** Which arrows show, and the strip on each physical side. */
function arrowState(page: Page, id: string) {
  return page.getByTestId(id).evaluate((host) => {
    const viewport = host.querySelector(
      '[data-slot="reel-viewport"]'
    ) as HTMLElement;
    const style = getComputedStyle(viewport);
    const area = (side: string) =>
      host.querySelector(
        `[data-slot="reel"] > span[data-side="${side}"]`
      ) as HTMLElement;
    // Shown means displayed (the gate) and visible (the overflow state).
    const shown = (side: string) => {
      const s = getComputedStyle(area(side));
      return s.display !== "none" && s.visibility === "visible";
    };
    return {
      start: shown("start"),
      end: shown("end"),
      left: style.getPropertyValue("--_ks-reel-inset-left"),
      right: style.getPropertyValue("--_ks-reel-inset-right"),
    };
  });
}

/**
 * Every pixel inside each shown chevron's 16 × 16 box and the 20px column on
 * that side of the Reel, with the chevrons themselves hidden, must be the
 * page surface behind the Reel. Returns the offending pixels.
 */
async function bandFailures(page: Page, id: string) {
  const host = page.getByTestId(id);
  const geometry = await host.evaluate((el) => {
    const origin = el.getBoundingClientRect();
    const reel = (
      el.querySelector('[data-slot="reel"]') as HTMLElement
    ).getBoundingClientRect();
    const shown = [
      ...el.querySelectorAll<HTMLElement>(
        '[data-slot="reel"] > span[data-side]'
      ),
    ]
      .filter((area) => getComputedStyle(area).visibility === "visible")
      .map((area) => {
        const glyph = (
          area.querySelector("svg") as SVGElement
        ).getBoundingClientRect();
        const box = area.getBoundingClientRect();
        const left = Math.abs(box.left - reel.left) < 1;
        return {
          side: area.dataset.side as string,
          physical: left ? "left" : "right",
          glyph: {
            x: glyph.left - origin.left,
            y: glyph.top - origin.top,
            w: glyph.width,
            h: glyph.height,
          },
        };
      });
    for (const svg of el.querySelectorAll<SVGElement>(
      '[data-slot="reel-arrow"] svg'
    )) {
      svg.style.visibility = "hidden";
    }
    return {
      reel: {
        x: reel.left - origin.left,
        y: reel.top - origin.top,
        w: reel.width,
        h: reel.height,
      },
      shown,
    };
  });
  const pixels = await shoot(page, host);
  await host.evaluate((el) => {
    for (const svg of el.querySelectorAll<SVGElement>(
      '[data-slot="reel-arrow"] svg'
    )) {
      svg.style.visibility = "";
    }
  });
  const surface = pixels.at(2, 2);
  const bad: string[] = [];
  const check = (x: number, y: number, what: string) => {
    const p = pixels.at(x, y);
    if (distance(p, surface) > 2) {
      bad.push(`${what} @${x.toFixed(1)},${y.toFixed(1)} = ${p.join(",")}`);
    }
  };
  const { reel } = geometry;
  for (const arrow of geometry.shown) {
    const { glyph } = arrow;
    for (let x = glyph.x + 0.25; x < glyph.x + glyph.w; x += 0.5) {
      for (let y = glyph.y + 0.25; y < glyph.y + glyph.h; y += 0.5) {
        check(x, y, `${arrow.side} glyph box`);
      }
    }
    for (let dx = 0.25; dx < 20; dx += 0.5) {
      const x = arrow.physical === "left" ? reel.x + dx : reel.x + reel.w - dx;
      for (let y = reel.y + 0.25; y < reel.y + reel.h; y += 1) {
        check(x, y, `${arrow.side} band`);
      }
    }
  }
  return { bad: bad.slice(0, 6), count: bad.length, shown: geometry.shown };
}

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((dark) => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, theme === "dark");
  await twoFrames(page);
}

/** Asserts the strip hides the row under every shown chevron. */
async function expectClear(page: Page, id: string, label: string) {
  const result = await bandFailures(page, id);
  expect(result.bad, `${label}: ${result.count} pixels`).toEqual([]);
  return result;
}

test.describe("Scrollable Tabs: the chevron never draws over a tab (T-DEFECT)", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const id of ["default", "line"]) {
      test(`${id}, ${theme}`, async ({ page }) => {
        await gotoFixture(page);
        await setTheme(page, theme);
        const max = await range(page, id);
        expect(max).toBeGreaterThan(40);

        // The end side before any scrolling: what everyone sees first.
        await scrollTo(page, id, 0);
        expect(await arrowState(page, id)).toEqual({
          start: false,
          end: true,
          left: "0px",
          right: "20px",
        });
        expect((await expectClear(page, id, "at 0")).shown).toHaveLength(1);

        for (const offset of [2, 8, Math.round(max / 2), max - 8, max - 2]) {
          // biome-ignore lint/performance/noAwaitInLoops: one position at a time
          await scrollTo(page, id, offset);
          expect(await arrowState(page, id), `at ${offset}`).toEqual({
            start: true,
            end: true,
            left: "20px",
            right: "20px",
          });
          await expectClear(page, id, `at ${offset}`);
        }

        // Exactly 1px from an end: that side shows no arrow and no strip.
        await scrollTo(page, id, max - 1);
        expect(await arrowState(page, id)).toMatchObject({
          end: false,
          right: "0px",
        });
        // Reversal: from 8px back to 1px.
        await scrollTo(page, id, 8);
        await expectClear(page, id, "back at 8");
        await scrollTo(page, id, 1);
        expect(await arrowState(page, id)).toMatchObject({
          start: false,
          left: "0px",
          end: true,
          right: "20px",
        });
        await expectClear(page, id, "back at 1");
      });
    }
  }
});

test("a narrow row with a deep fade still clears both chevrons (T-DEFECT-NARROW)", async ({
  page,
}) => {
  await gotoFixture(page);
  const max = await range(page, "narrow");
  await scrollTo(page, "narrow", Math.round(max / 2));
  const result = await expectClear(page, "narrow", "narrow mid");
  expect(result.shown.map((arrow) => arrow.side).sort()).toEqual([
    "end",
    "start",
  ]);
});

test.describe("Scrollable Tabs in right-to-left (T-DEFECT-RTL)", () => {
  for (const id of ["rtl", "rdir"]) {
    test(
      id === "rtl" ? 'dir="rtl" on an ancestor' : "direction: rtl without dir",
      async ({ page }) => {
        await gotoFixture(page);
        const max = await range(page, id);
        await scrollTo(page, id, 0);
        // At the start in rtl the end arrow is on the left.
        expect(await arrowState(page, id)).toEqual({
          start: false,
          end: true,
          left: "20px",
          right: "0px",
        });
        await expectClear(page, id, `${id} at 0`);
        await scrollTo(page, id, Math.round(max / 2));
        const result = await expectClear(page, id, `${id} mid`);
        expect(
          Object.fromEntries(
            result.shown.map((arrow) => [arrow.side, arrow.physical])
          )
        ).toEqual({ start: "right", end: "left" });
      }
    );
  }
});

/** The zero depth exactly as the Reel page tells readers to write it. */
function documentedZero() {
  const mdx = readFileSync(
    join(import.meta.dirname, "../content/docs/components/reel.mdx"),
    "utf-8"
  );
  const match = mdx.match(DOCUMENTED_ZERO);
  if (!match) {
    throw new Error("reel.mdx no longer documents the zero spelling");
  }
  return match[1];
}

test("a zero and a deep fade keep the strip and the clearance (T-ZERO-RAMP)", async ({
  page,
}) => {
  await gotoFixture(page);
  // The zero row takes the spelling the docs give, not one of its own.
  const zero = documentedZero();
  await page
    .getByTestId("zero")
    .locator('[data-slot="tabs"]')
    .evaluate((el, value) => {
      (el as HTMLElement).style.setProperty("--ks-reel-fade-size", value);
    }, zero);
  for (const [id, padding] of [
    ["zero", "48px"],
    ["deep", "116px"],
  ] as const) {
    // biome-ignore lint/performance/noAwaitInLoops: two rows, in order
    const max = await range(page, id);
    await scrollTo(page, id, Math.round(max / 2));
    await expectClear(page, id, `${id} mid`);
    const style = await page
      .getByTestId(id)
      .locator('[data-slot="reel-viewport"]')
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { mask: s.maskImage, padding: s.scrollPaddingInlineStart };
      });
    expect(style.mask, id).not.toBe("none");
    expect(style.padding, id).toBe(padding);
  }
});

/**
 * Scroll the default row to `to` (or leave it, for null) and sample `count`
 * animation frames: whether the start chevron is painted (its effective
 * visibility and opacity through the picture and the hit area), what takes
 * a press at its centre, and the strip on that side.
 */
function sampleStartArrow(page: Page, to: number | null, count: number) {
  return page.getByTestId("default").evaluate(
    (el, [scrollTo, frames]) => {
      const viewport = el.querySelector(
        '[data-slot="reel-viewport"]'
      ) as HTMLElement;
      const area = el.querySelector(
        '[data-slot="reel"] > span[data-side="start"]'
      ) as HTMLElement;
      const svg = area.querySelector("svg") as SVGElement;
      const firstTab = el.querySelector('[role="tab"]') as HTMLElement;
      const what = (hit: Element | null) => {
        if (hit && area.contains(hit)) {
          return "arrow";
        }
        return hit && firstTab.contains(hit) ? "tab" : "other";
      };
      const glyph = () => {
        let opacity = 1;
        for (
          let node: Element | null = svg;
          node && node !== el;
          node = node.parentElement
        ) {
          opacity *= Number(getComputedStyle(node).opacity);
        }
        return getComputedStyle(svg).visibility === "visible" && opacity > 0
          ? "shown"
          : "hidden";
      };
      if (scrollTo !== null) {
        viewport.scrollLeft = scrollTo;
      }
      const out: { glyph: string; hit: string; strip: string }[] = [];
      return new Promise<typeof out>((resolve) => {
        const tick = () => {
          const r = svg.getBoundingClientRect();
          const hit = document.elementFromPoint(
            r.left + r.width / 2,
            r.top + r.height / 2
          );
          out.push({
            glyph: glyph(),
            hit: what(hit),
            strip: getComputedStyle(viewport).getPropertyValue(
              "--_ks-reel-inset-left"
            ),
          });
          if (out.length < frames) {
            requestAnimationFrame(tick);
          } else {
            resolve(out);
          }
        };
        requestAnimationFrame(tick);
      });
    },
    [to, count] as const
  );
}

test.describe("A press just after an arrow hides (T-CLICK-AFTER)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("lands on the tab beneath, on the next frame", async ({ page }) => {
    await gotoFixture(page);
    const host = page.getByTestId("default");
    await host.getByRole("tab", { name: "Users" }).click();
    await expect(host.getByRole("tab", { name: "Users" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await page.waitForTimeout(600);
    await scrollTo(page, "default", 0);
    // Hidden, the press at the chevron's centre lands on the first tab.
    const HIDDEN = { glyph: "hidden", hit: "tab", strip: "0px" };
    const SHOWN = { glyph: "shown", hit: "arrow", strip: "20px" };
    // The starting state, before crossing the threshold.
    expect(await sampleStartArrow(page, null, 1)).toEqual([HIDDEN]);
    // Across the threshold both ways, sampled in each of the next four
    // animation frames: in every frame the chevron as painted, what takes a
    // press at its centre, and its strip agree; from the second frame (the
    // first rendered after the update) the new state holds.
    for (const [to, state] of [
      [3, SHOWN],
      [0, HIDDEN],
    ] as const) {
      // biome-ignore lint/performance/noAwaitInLoops: one crossing at a time
      const frames = await sampleStartArrow(page, to, 4);
      for (const frame of frames) {
        expect([SHOWN, HIDDEN], `to ${to}`).toContainEqual(frame);
      }
      expect(frames.slice(1), `to ${to}`).toEqual(new Array(3).fill(state));
    }
    const first = host.getByRole("tab", { name: "Dashboard" });
    const box = await first.boundingBox();
    if (!box) {
      throw new Error("no first tab");
    }
    await page.mouse.click(box.x + 2, box.y + box.height / 2);
    await expect(first).toHaveAttribute("aria-selected", "true");
    expect(
      await host
        .locator('[data-slot="reel-viewport"]')
        .evaluate((el) => el.scrollLeft)
    ).toBe(0);
  });
});

/**
 * Browsers without scroll-driven animations: the built stylesheet is served
 * with every `@supports (animation-timeline: scroll())` condition rewritten
 * to one no browser supports.
 */
async function withoutScrollTimelines(page: Page) {
  await page.route("**/*.css", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /@supports\s*\(animation-timeline:\s*scroll\(\)\)/g,
      "@supports (animation-timeline:ks-unsupported())"
    );
    await route.fulfill({ response, body });
  });
}

test.describe("Without scroll-driven animations (T-FALLBACK)", () => {
  test("a plain arrow still hides the row under it and takes the press", async ({
    page,
  }) => {
    await withoutScrollTimelines(page);
    await gotoFixture(page);
    const viewport = page
      .getByTestId("default")
      .locator('[data-slot="reel-viewport"]');
    // The rewrite took: no scroll-timeline animation runs.
    expect(
      await viewport.evaluate((el) => getComputedStyle(el).animationName)
    ).toBe("none");
    const max = await range(page, "default");
    await scrollTo(page, "default", Math.round(max / 2));
    const result = await expectClear(page, "default", "fallback mid");
    expect(result.shown).toHaveLength(2);
    // Each chevron's centre hits its own hit area, above triggers that are
    // `relative z-[1]`.
    const hits = await page.getByTestId("default").evaluate((host) =>
      [...host.querySelectorAll<HTMLElement>('[data-slot="reel-arrow"]')].map(
        (arrow) => {
          const r = arrow.getBoundingClientRect();
          const hit = document.elementFromPoint(
            r.left + r.width / 2,
            r.top + r.height / 2
          );
          return (
            hit === arrow.parentElement || arrow.parentElement?.contains(hit)
          );
        }
      )
    );
    expect(hits).toEqual([true, true]);
  });

  test("a default Reel and a bare utility row keep no mask", async ({
    page,
  }) => {
    await withoutScrollTimelines(page);
    await page.goto("/e2e/reel-plain");
    await page
      .locator('html[data-fixture-hydrated="reel-plain"]')
      .waitFor({ state: "attached" });
    const masks = await page.evaluate(() =>
      ["default-always", "utility"].map((id) => {
        const host = document.querySelector(
          `[data-testid="${id}"]`
        ) as HTMLElement;
        const el = host.querySelector(
          '[data-slot="reel-viewport"], .ks-scroll-fade-x'
        ) as HTMLElement;
        return getComputedStyle(el).maskImage;
      })
    );
    expect(masks).toEqual(["none", "none"]);
    // With no mask the viewport is still its own stacking context, so the
    // default arrows stay above items that are `relative z-[1]`.
    const hits = await page.getByTestId("default-stacked").evaluate((host) => {
      const viewport = host.querySelector(
        '[data-slot="reel-viewport"]'
      ) as HTMLElement;
      viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
      // The default arrows fade in; read once both have shown.
      return new Promise<boolean[]>((resolve) =>
        setTimeout(
          () =>
            requestAnimationFrame(() =>
              resolve(
                [
                  ...host.querySelectorAll<HTMLElement>(
                    '[data-slot="reel"] > span[data-side]'
                  ),
                ].map((area) => {
                  const r = area.getBoundingClientRect();
                  const hit = document.elementFromPoint(
                    r.left + r.width / 2,
                    r.top + r.height / 2
                  );
                  return Boolean(hit && area.contains(hit));
                })
              )
            ),
          400
        )
      );
    });
    expect(hits).toEqual([true, true]);
  });
});

test.describe("Scrollable Tabs on a touch-primary device (T-TOUCH-TABS)", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { height: 812, width: 375 },
  });

  // What the component promises is a CSS rule, not how a browser turns an
  // emulated touch into `:active` (that differs between macOS and headless
  // Linux, and no real finger runs here): with hover gated off, the plain
  // chevron is muted at rest, takes the foreground colour while its hit area
  // is `:active`, and lets go to muted. The states are forced through the
  // DevTools protocol so each one is read deterministically.
  test("turn the chevron to the foreground colour while its hit area is active", async ({
    page,
  }) => {
    await gotoFixture(page);
    expect(
      await page.evaluate(() => matchMedia("(hover: hover)").matches)
    ).toBe(false);
    await scrollTo(page, "phone", 0);
    const colours = await page.evaluate(() => {
      const probe = (className: string) => {
        const el = document.createElement("span");
        el.className = className;
        document.body.append(el);
        const colour = getComputedStyle(el).color;
        el.remove();
        return colour;
      };
      return {
        foreground: probe("text-foreground"),
        muted: probe("text-muted-foreground"),
      };
    });
    expect(colours.foreground).not.toBe(colours.muted);
    const host = page.getByTestId("phone");
    const svg = host.locator('[data-slot="reel-arrow"][data-side="end"] svg');
    const colour = () => svg.evaluate((el) => getComputedStyle(el).color);
    await expect.poll(colour).toBe(colours.muted);

    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
    const { nodeId } = await cdp.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector:
        '[data-testid="phone"] [data-slot="reel"] > span[data-side="end"]',
    });
    expect(nodeId).toBeGreaterThan(0);
    const force = (forcedPseudoClasses: string[]) =>
      cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses });

    // Hover alone does nothing here: the hover rule is gated on
    // `(hover: hover)`. Two frames outlast the colour transition, which runs
    // 0.01ms under the config's reduced motion.
    await force(["hover"]);
    await twoFrames(page);
    expect(await colour()).toBe(colours.muted);
    await force([]);

    await force(["active"]);
    await expect.poll(colour).toBe(colours.foreground);
    await force([]);
    await expect.poll(colour).toBe(colours.muted);
    await cdp.detach();

    // A real tap still pages the row by one press; its colour is not asserted.
    const box = await svg.boundingBox();
    if (!box) {
      throw new Error("no end chevron");
    }
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await expect
      .poll(() =>
        host
          .locator('[data-slot="reel-viewport"]')
          .evaluate((el) => el.scrollLeft)
      )
      .toBeGreaterThan(100);
  });

  test("show the end chevron at scroll 0, and a tap pages", async ({
    page,
  }) => {
    await gotoFixture(page);
    expect(
      await page.evaluate(
        () => matchMedia("(hover: hover) and (pointer: fine)").matches
      )
    ).toBe(false);
    const host = page.getByTestId("phone");
    const viewport = host.locator('[data-slot="reel-viewport"]');
    expect(await viewport.evaluate((el) => el.clientWidth)).toBe(343);
    await scrollTo(page, "phone", 0);
    expect(await arrowState(page, "phone")).toMatchObject({
      end: true,
      right: "20px",
    });
    // The chevron is painted on screen, and a press there lands on its hit
    // area.
    const glyph = await host.evaluate((el) => {
      const svg = el.querySelector(
        '[data-slot="reel-arrow"][data-side="end"] svg'
      ) as SVGElement;
      const area = el.querySelector(
        '[data-slot="reel"] > span[data-side="end"]'
      ) as HTMLElement;
      const r = svg.getBoundingClientRect();
      const hit = document.elementFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2
      );
      return {
        w: r.width,
        h: r.height,
        onScreen: r.left >= 0 && r.right <= window.innerWidth,
        hitsArea: Boolean(hit && area.contains(hit)),
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      };
    });
    expect(glyph).toMatchObject({
      w: 16,
      h: 16,
      onScreen: true,
      hitsArea: true,
    });
    await page.touchscreen.tap(glyph.x, glyph.y);
    await expect
      .poll(() => viewport.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(100);
  });
});

test("right-to-left pages toward negative scrollLeft from the left arrow (T-RTL-PAGE)", async ({
  page,
}) => {
  await gotoFixture(page);
  const host = page.getByTestId("rtl");
  const geometry = await host.evaluate((el) => {
    const reel = (
      el.querySelector('[data-slot="reel"]') as HTMLElement
    ).getBoundingClientRect();
    const area = (side: string) =>
      (
        el.querySelector(
          `[data-slot="reel"] > span[data-side="${side}"]`
        ) as HTMLElement
      ).getBoundingClientRect();
    const viewport = el.querySelector(
      '[data-slot="reel-viewport"]'
    ) as HTMLElement;
    return {
      startOnRight: Math.abs(area("start").right - reel.right) < 1,
      endOnLeft: Math.abs(area("end").left - reel.left) < 1,
      mask: getComputedStyle(viewport).maskImage,
    };
  });
  expect(geometry.startOnRight).toBe(true);
  expect(geometry.endOnLeft).toBe(true);
  // The soft fade is the last of the three layers, and runs from the right,
  // where the row starts. The two strip layers always run "to right" and
  // "to left", whatever the direction.
  const layers = geometry.mask.split("linear-gradient(").slice(1);
  expect(layers).toHaveLength(3);
  expect(layers[2].startsWith("to left")).toBe(true);
  // At scroll 0 the right edge has no strip and no fade: the track shows.
  await scrollTo(page, "rtl", 0);
  const pixels = await shoot(page, host);
  const reelBox = await host.evaluate((el) => {
    const r = (
      el.querySelector('[data-slot="reel"]') as HTMLElement
    ).getBoundingClientRect();
    const o = el.getBoundingClientRect();
    return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
  });
  const surface = pixels.at(2, 2);
  const edge = pixels.at(reelBox.x + reelBox.w - 3, reelBox.y + 3);
  expect(distance(edge, surface)).toBeGreaterThan(2);
  await host.locator('[data-slot="reel"] > span[data-side="end"]').click();
  await expect
    .poll(() =>
      host
        .locator('[data-slot="reel-viewport"]')
        .evaluate((el) => el.scrollLeft)
    )
    .toBeLessThan(-100);
});

/**
 * At small and large root font sizes a keyboard-focused tab's 2px outline,
 * 2px out, is painted whole at either end of the range: the list keeps at
 * least 4px of padding inside the scroller's clip.
 */
test.describe("Focus outlines at other root sizes (T-OUTLINE)", () => {
  for (const root of [10, 24]) {
    test(`at a ${root}px root`, async ({ page }) => {
      await gotoFixture(page);
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = `${size}px`;
      }, root);
      await twoFrames(page);
      const host = page.getByTestId("default");
      const ring = async (name: string) => {
        const tab = host.getByRole("tab", { name });
        const box = await tab.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const o = (
            el.closest('[data-testid="default"]') as HTMLElement
          ).getBoundingClientRect();
          return {
            x: r.left - o.left,
            y: r.top - o.top,
            w: r.width,
            h: r.height,
          };
        });
        // The middle of each side of the outline, in both pixels of its 2px
        // stroke (2 to 4px out from the border), the outermost included.
        return [2.5, 3.5].flatMap((out) => [
          [box.x - out, box.y + box.h / 2],
          [box.x + box.w + out, box.y + box.h / 2],
          [box.x + box.w / 2, box.y - out],
          [box.x + box.w / 2, box.y + box.h + out],
        ]) as [number, number][];
      };
      const outlined = async (name: string) => {
        const points = await ring(name);
        const focused = await shoot(page, host);
        await page.evaluate(() =>
          (document.activeElement as HTMLElement).blur()
        );
        await twoFrames(page);
        const plain = await shoot(page, host);
        return points.map(
          ([x, y]) => distance(focused.at(x, y), plain.at(x, y)) > 2
        );
      };

      // Keyboard into the list: the first (active) tab, at the start.
      await page.keyboard.press("Tab");
      await expect(host.getByRole("tab", { name: "Dashboard" })).toBeFocused();
      await twoFrames(page);
      expect(await outlined("Dashboard"), "first tab").toEqual(
        new Array(8).fill(true)
      );

      // End: the last tab, at the end of the range.
      await host.getByRole("tab", { name: "Dashboard" }).focus();
      await page.keyboard.press("End");
      await expect(host.getByRole("tab", { name: "Settings" })).toBeFocused();
      await twoFrames(page);
      const viewport = host.locator('[data-slot="reel-viewport"]');
      expect(
        await viewport.evaluate(
          (el) => el.scrollWidth - el.clientWidth - el.scrollLeft
        )
      ).toBeLessThan(1);
      expect(await outlined("Settings"), "last tab").toEqual(
        new Array(8).fill(true)
      );
    });
  }
});

/**
 * The strip's ramp, read from a uniform row at the stock depth: hidden
 * through 19px, then rising without a step, and the row in full by 53px
 * (20px strip + 32px ramp), near both ends of the range; with and without
 * scroll-driven animations.
 */
async function rampSamples(
  page: Page,
  id: string,
  where: "near-start" | "near-end",
  px: number
) {
  const host = page.getByTestId(id);
  await host.evaluate(
    (el, [at, by]) => {
      const viewport = el.querySelector(
        '[data-slot="reel-viewport"]'
      ) as HTMLElement;
      const max = viewport.scrollWidth - viewport.clientWidth;
      viewport.scrollLeft = at === "near-start" ? by : max - by;
      for (const svg of el.querySelectorAll<SVGElement>("svg")) {
        svg.style.visibility = "hidden";
      }
    },
    [where, px] as const
  );
  await twoFrames(page);
  const pixels = await shoot(page, host.locator('[data-slot="reel-viewport"]'));
  const y = pixels.height / 2;
  const at = (x: number) =>
    pixels.at(where === "near-start" ? x : pixels.width - x, y);
  const bg = at(1);
  const fg = pixels.at(pixels.width / 2, y);
  const alpha = (x: number) => (bg[0] - at(x)[0]) / (bg[0] - fg[0]);
  return [0, 10, 19, 22, 26, 30, 36, 42, 48, 53].map((x) => ({
    x,
    a: Math.round(alpha(x) * 100) / 100,
  }));
}

function rampFailures(samples: { x: number; a: number }[], label: string) {
  const failures: string[] = [];
  for (const { x, a } of samples) {
    if (x <= 19 && a > 0.02) {
      failures.push(`${label} x=${x}: ${a} under the strip`);
    }
    if (x >= 53 && a < 0.97) {
      failures.push(`${label} x=${x}: ${a} past the ramp`);
    }
  }
  const ramp = samples.filter(({ x }) => x >= 20 && x < 53);
  for (let i = 1; i < ramp.length; i++) {
    if (ramp[i].a < ramp[i - 1].a - 0.02) {
      failures.push(`${label} x=${ramp[i].x}: falls to ${ramp[i].a}`);
    }
  }
  if (ramp.filter(({ a }) => a > 0.05 && a < 0.95).length < 3) {
    failures.push(`${label}: no gradual ramp ${JSON.stringify(ramp)}`);
  }
  return failures;
}

test.describe("The strip's ramp has no hard edge", () => {
  for (const timelines of [true, false]) {
    test(
      timelines
        ? "with scroll-driven animations"
        : "without scroll-driven animations",
      async ({ page }) => {
        if (!timelines) {
          await withoutScrollTimelines(page);
        }
        await page.goto("/e2e/reel-plain");
        await page
          .locator('html[data-fixture-hydrated="reel-plain"]')
          .waitFor({ state: "attached" });
        const failures: string[] = [];
        for (const [where, px] of [
          ["near-start", 2],
          ["near-start", 8],
          ["near-end", 8],
          ["near-end", 2],
        ] as const) {
          // biome-ignore lint/performance/noAwaitInLoops: one position at a time
          const samples = await rampSamples(page, "stock-ltr", where, px);
          failures.push(...rampFailures(samples, `${where} ${px}px`));
        }
        expect(failures).toEqual([]);
      }
    );
  }
});

test("the plain arrow, its press target and its strip switch in the same frame", async ({
  page,
}) => {
  await gotoFixture(page);
  await scrollTo(page, "default", 0);
  const first = await page.getByTestId("default").evaluate((host) => {
    const viewport = host.querySelector(
      '[data-slot="reel-viewport"]'
    ) as HTMLElement;
    const area = host.querySelector(
      '[data-slot="reel"] > span[data-side="start"]'
    ) as HTMLElement;
    viewport.scrollLeft = 3;
    return new Promise<{ visibility: string; hit: boolean; frames: number }>(
      (resolve) => {
        let frames = 0;
        const tick = () => {
          frames++;
          const inset = getComputedStyle(viewport).getPropertyValue(
            "--_ks-reel-inset-left"
          );
          if (inset === "20px" || frames > 30) {
            const r = area.getBoundingClientRect();
            const hit = document.elementFromPoint(
              r.left + r.width / 2,
              r.top + r.height / 2
            );
            resolve({
              visibility: getComputedStyle(area).visibility,
              hit: Boolean(hit && area.contains(hit)),
              frames,
            });
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    );
  });
  expect(first.frames).toBeLessThanOrEqual(30);
  expect(first).toMatchObject({ visibility: "visible", hit: true });
});
