import { expect, type Locator, type Page, test } from "@playwright/test";

import { gotoPreview } from "./preview";

/**
 * The info tip (an ⓘ beside a label whose popup is the only place its text
 * appears) has to work on a phone as well as with a mouse: hover on desktop,
 * tap on touch.
 *
 * Every touch check runs in a fresh context created with `hasTouch` and a
 * phone viewport. Touch emulation is never switched on and off inside one
 * context: on headless Linux `(hover: hover)` stays false afterwards.
 *
 * This is Chromium's emulated touch, not a real phone.
 */

const TRIGGER = "Pickup p50 definition";
const TEXT =
  "Ready-and-requested until someone other than the author reviews. The most common place teams lose days.";

const PHONE = { height: 844, width: 390 };
// WCAG 2.2 SC 2.5.8, Target Size (Minimum).
const MIN_TARGET = 24;
// Past any delayed close a regression could schedule after a tap.
const LATE_CALLBACKS_MS = 5000;

const DEMO = "tooltip-info-tip";

function trigger(page: Page): Locator {
  return page.getByRole("button", { exact: true, name: TRIGGER });
}

async function rect(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("not rendered");
  }
  return box;
}

/**
 * The box once it stops changing: the popup scales in as it opens. The first
 * poll never counts, so two reads are always at least one interval apart.
 */
async function settledRect(locator: Locator) {
  let previous = "";
  let box = await rect(locator);
  await expect
    .poll(async () => {
      box = await rect(locator);
      const same = JSON.stringify(box) === previous;
      previous = JSON.stringify(box);
      return same;
    })
    .toBe(true);
  return box;
}

/** Reload the preview with `dir="rtl"` on `<html>` before the first paint. */
async function loadInRtl(page: Page) {
  await page.addInitScript(() => {
    new MutationObserver((_, observer) => {
      if (document.documentElement) {
        document.documentElement.dir = "rtl";
        observer.disconnect();
      }
    }).observe(document, { childList: true });
  });
  await gotoPreview(page, DEMO);
}

function popup(page: Page): Locator {
  return page
    .locator('[data-slot="tooltip-content"]')
    .filter({ hasText: TEXT });
}

test.describe("info tip under touch", () => {
  test.use({ hasTouch: true, viewport: PHONE });

  test.beforeEach(async ({ page }) => {
    // Time flows normally; the tap test fast-forwards it on purpose.
    await page.clock.install();
    await gotoPreview(page, DEMO);
  });

  test("a tap opens it and a second tap closes it", async ({ page }) => {
    await trigger(page).tap();
    // Fire every timer the tap scheduled, so a delayed close cannot slip
    // past the assertions below.
    await page.clock.runFor(LATE_CALLBACKS_MS);
    await expect(trigger(page)).toHaveAttribute("data-popup-open", "");
    await expect(popup(page)).toBeVisible();

    await trigger(page).tap();
    await expect(trigger(page)).not.toHaveAttribute("data-popup-open");
    await expect(popup(page)).toBeHidden();
  });

  test("a tap outside closes it", async ({ page }) => {
    await trigger(page).tap();
    await expect(popup(page)).toBeVisible();

    await page.getByText("3h 12m").tap();
    await expect(popup(page)).toBeHidden();
  });

  test("scrolling the page does not leave it stuck open", async ({ page }) => {
    // Room above and below, so the trigger can sit mid-screen and still be
    // on screen after the drag.
    await page.evaluate(() => {
      document.body.style.paddingBlock = "400px 3000px";
    });
    await trigger(page).scrollIntoViewIfNeeded();
    await trigger(page).tap();
    await expect(popup(page)).toBeVisible();

    const scrollBefore = await page.evaluate(() => window.scrollY);
    const anchorBefore = await rect(trigger(page));
    const tipBefore = await settledRect(popup(page));

    // A finger that lands on the open trigger, drags the page up 190 px and
    // holds still before lifting, as raw touch events. Headless Chromium on
    // Linux ignores a touch `Input.synthesizeScrollGesture` (the page never
    // scrolls); these events scroll it on Linux and macOS alike. The event
    // timestamps (seconds) pace the drag and give the hold, so the finger
    // lifts at rest and the page does not fling past the drag.
    const client = await page.context().newCDPSession(page);
    const fingerX = anchorBefore.x + anchorBefore.width / 2;
    const fingerY = anchorBefore.y + anchorBefore.height / 2;
    const DRAG = 190;
    const STEPS = 10;
    const FRAME_S = 0.016;
    const HOLD_S = 0.3;
    const start = Date.now() / 1000;
    const finger = (step: number) => [
      { x: fingerX, y: fingerY - (DRAG * step) / STEPS },
    ];
    await client.send("Input.dispatchTouchEvent", {
      timestamp: start,
      touchPoints: finger(0),
      type: "touchStart",
    });
    for (let step = 1; step <= STEPS; step += 1) {
      // biome-ignore lint/performance/noAwaitInLoops: one finger, moved in turn
      await client.send("Input.dispatchTouchEvent", {
        timestamp: start + step * FRAME_S,
        touchPoints: finger(step),
        type: "touchMove",
      });
    }
    const lift = start + STEPS * FRAME_S + HOLD_S;
    await client.send("Input.dispatchTouchEvent", {
      timestamp: lift,
      touchPoints: finger(STEPS),
      type: "touchMove",
    });
    await client.send("Input.dispatchTouchEvent", {
      timestamp: lift,
      touchPoints: [],
      type: "touchEnd",
    });
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(scrollBefore + 100);

    // Not stuck: either the drag closed it, or it moved with its trigger and
    // still sits on the side it reports.
    const openAfterScroll = await popup(page).isVisible();
    test.info().annotations.push({
      description: openAfterScroll
        ? "open after the drag, following its trigger"
        : "the drag closed it",
      type: "scroll",
    });
    if (openAfterScroll) {
      // A finger's drag can end in a fling: measure once the page has
      // stopped moving, or the trigger's box is stale by the gap check.
      const anchor = await settledRect(trigger(page));
      expect(anchor.y).toBeLessThan(anchorBefore.y - 100);
      // The popup repositions a frame after the scroll; it must catch up
      // with its trigger, not stay where it was.
      await expect
        .poll(async () => {
          const moved = (await rect(trigger(page))).y - anchorBefore.y;
          return Math.abs((await rect(popup(page))).y - tipBefore.y - moved);
        })
        .toBeLessThan(2);
      const tip = await rect(popup(page));
      const side = await popup(page).getAttribute("data-side");
      const gap =
        side === "top"
          ? anchor.y - (tip.y + tip.height)
          : tip.y - (anchor.y + anchor.height);
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThan(MIN_TARGET);

      // A point already on screen, away from both, so dismissing does not
      // scroll the trigger back.
      await page.touchscreen.tap(PHONE.width - 8, PHONE.height - 8);
    }
    await expect(popup(page)).toBeHidden();
  });

  test("the trigger is named and the text reaches assistive technology", async ({
    page,
  }) => {
    // The text is the trigger's description, and nothing else: neither the
    // description source nor the open popup is an item of its own in reading
    // order, where it would be read a second time.
    const readingOrderMentions = async () =>
      (await page.locator("body").ariaSnapshot()).split(TEXT).length - 1;

    await expect(trigger(page)).toHaveRole("button");
    await expect(trigger(page)).toHaveAccessibleName(TRIGGER);
    await expect(trigger(page)).toHaveAccessibleDescription(TEXT);
    expect(await readingOrderMentions()).toBe(0);

    await trigger(page).tap();
    await expect(popup(page)).toBeVisible();
    await expect(trigger(page)).toHaveAccessibleDescription(TEXT);
    expect(await readingOrderMentions()).toBe(0);
  });

  for (const direction of ["ltr", "rtl, loaded", "rtl, switched live"]) {
    test(`the reachable tap target is 24 by 24 and grows away from the label (${direction})`, async ({
      page,
    }) => {
      if (direction === "rtl, loaded") {
        await loadInRtl(page);
      }
      const switchLive = direction === "rtl, switched live";
      const hit = await page.evaluate(
        ({ name, live }) => {
          // Switched and measured in one task: no frame passes in between, as
          // for a tap that lands right after an app flips its direction.
          if (live) {
            document.documentElement.dir = "rtl";
          }
          const button = document.querySelector(`button[aria-label="${name}"]`);
          const term = button?.closest("dt");
          const label = term?.firstChild;
          const icon = button?.querySelector("svg");
          if (!(button && label && icon)) {
            throw new Error("info tip markup not found");
          }
          const range = document.createRange();
          range.selectNodeContents(label);
          const text = range.getBoundingClientRect();
          const glyph = icon.getBoundingClientRect();
          const hits = (x: number, y: number) => {
            const node = document.elementFromPoint(x, y);
            return node !== null && button.contains(node);
          };
          // Every point that reaches the button, inside the viewport only:
          // elementFromPoint returns null off screen.
          const step = 0.5;
          const area = { bottom: -1, left: 1e9, right: -1, top: 1e9 };
          for (let y = glyph.top - 16; y <= glyph.bottom + 16; y += step) {
            for (let x = glyph.left - 16; x <= glyph.right + 16; x += step) {
              if (hits(x, y)) {
                area.left = Math.min(area.left, x);
                area.right = Math.max(area.right, x + step);
                area.top = Math.min(area.top, y);
                area.bottom = Math.max(area.bottom, y + step);
              }
            }
          }
          const rtl = document.documentElement.dir === "rtl";
          const labelEdge = rtl ? text.left : text.right;
          const towardIcon = rtl ? -1 : 1;
          const middle = glyph.top + glyph.height / 2;
          return {
            area,
            beyondIcon: hits(rtl ? glyph.left - 2 : glyph.right + 2, middle),
            gapBesideLabel: hits(labelEdge + towardIcon, middle),
            labelEdge,
            onLabel: hits(labelEdge - towardIcon, middle),
            rtl,
          };
        },
        { live: switchLive, name: TRIGGER }
      );

      expect(hit.rtl).toBe(direction !== "ltr");
      expect(hit.area.right - hit.area.left).toBeGreaterThanOrEqual(MIN_TARGET);
      expect(hit.area.bottom - hit.area.top).toBeGreaterThanOrEqual(MIN_TARGET);
      // It stops at the label: a tap on the label is the label's. Hit testing
      // snaps to whole pixels, so the area's edge is known to within one.
      expect(hit.onLabel).toBe(false);
      if (hit.rtl) {
        expect(hit.area.right).toBeLessThanOrEqual(hit.labelEdge + 1);
      } else {
        expect(hit.area.left).toBeGreaterThanOrEqual(hit.labelEdge - 1);
      }
      expect(hit.gapBesideLabel).toBe(true);
      expect(hit.beyondIcon).toBe(true);
    });
  }
});

test.describe("info tip beside the next control", () => {
  test.use({ hasTouch: true, viewport: PHONE });

  for (const direction of ["ltr", "rtl"]) {
    for (const fontSize of ["100%", "200%"]) {
      test(`a tap just inside a control after the list is the control's (${direction}, ${fontSize} text)`, async ({
        page,
      }) => {
        if (direction === "rtl") {
          await loadInRtl(page);
        } else {
          await gotoPreview(page, DEMO);
        }
        await page.evaluate((size) => {
          document.documentElement.style.fontSize = size;
          const input = document.createElement("input");
          input.setAttribute("aria-label", "Next control");
          input.style.cssText = "display:block;width:100%;height:32px";
          document.querySelector("dl")?.after(input);
        }, fontSize);
        const last = page.getByRole("button", {
          exact: true,
          name: "Coding p50 definition",
        });
        const input = page.getByRole("textbox", { name: "Next control" });
        // Under reduced motion the project gives every transition 0.01 ms,
        // so the first read after the font change is still the old layout.
        const icon = await settledRect(last.locator("svg"));
        const field = await settledRect(input);

        // One pixel inside the control, straight below the last icon.
        await page.touchscreen.tap(icon.x + icon.width / 2, field.y + 1);

        await expect(input).toBeFocused();
        await expect(last).not.toHaveAttribute("data-popup-open");
        await expect(page.locator('[data-slot="tooltip-content"]')).toHaveCount(
          0
        );
      });
    }
  }
});

test.describe("info tip with a mouse and a keyboard", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPreview(page, DEMO);
  });

  test("hover opens it and leaving closes it", async ({ page }) => {
    await trigger(page).hover();
    await expect(popup(page)).toBeVisible();

    await page.mouse.move(0, 0);
    await expect(popup(page)).toBeHidden();
  });

  test("keyboard focus opens it and Escape closes it", async ({ page }) => {
    // The trigger is the first focusable element in the preview, so one Tab
    // gives it keyboard (focus-visible) focus.
    await page.keyboard.press("Tab");
    await expect(trigger(page)).toBeFocused();
    await expect(popup(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(popup(page)).toBeHidden();
    await expect(trigger(page)).toBeFocused();
  });
});
